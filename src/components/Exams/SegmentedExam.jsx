import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { addSegmentedExamSubject, getSegmentedExamSubject, addSegmentedExamSubjectFailed } from '../../stateManager/reducers/examSlice';
import { useDispatch, useSelector } from 'react-redux';
import './SegmentedExam.style.css';


const SubjectSelection = forwardRef(({
    examId,
    segmentedExamDetails, subjects, visible, isPracticeExam 
}, ref) => {

    console.log("SubjectSelection", examId);
    console.log(segmentedExamDetails);
    console.log(subjects);

    const dispatch = useDispatch();

    const student = JSON.parse(localStorage.getItem('student'));

    const [mandatorySubjects] = useState(segmentedExamDetails.mandatorySubjects);
    const [compulsoryOptionalSubjects] = useState(segmentedExamDetails.compulsoryOptionalSubjects);
    const [optionalSubjects] = useState(segmentedExamDetails.optionalSubjects);
    const [totalSubjects] = useState(segmentedExamDetails.totalSubjects);
    const [totalQuestions] = useState(segmentedExamDetails.totalQuestions);
    const [minimumCompulsoryOptionalSubjects] = useState(segmentedExamDetails.minimumCompulsoryOptionalSubjects);

    const [selectedCompulsoryOptional, setSelectedCompulsoryOptional] = useState([]);
    const [selectedOptionalSubjects, setSelectedOptionalSubjects] = useState([]);
    const segmentedExamSubjectSelectedSubmitted = useSelector(
		state => state.exams.segmentedExamSubjectSelectedSubmitted
	);

    const [totalQuestionsSelected, setTotalQuestionsSelected] = useState(0);
    // no submit button if already submitted
     const [submitted, setSubmitted] = useState(false);



    // Calculate the total selected subjects count
    const totalSelectedSubjects = mandatorySubjects.length + selectedCompulsoryOptional.length + selectedOptionalSubjects.length;
    const totalMandtoryCompulsoryOptional = mandatorySubjects.length + selectedCompulsoryOptional.length;
    // if totalMandatoryCompulsoryOptional is equal to totalSubjects, then no need to select optional subjects, clear the selectedOptionalSubjects
     useEffect(() => {
        
        if (mandatorySubjects.length + selectedCompulsoryOptional.length === totalSubjects) {
            setSelectedOptionalSubjects([]);
        }
    }, [selectedCompulsoryOptional, mandatorySubjects, totalSubjects]);

    const submitSegmentedExamSubject = async () => {

        console.log("totalQuestionsSelected", totalQuestionsSelected);

        if (selectedCompulsoryOptional.length < minimumCompulsoryOptionalSubjects) {
            alert(`You must select at least ${minimumCompulsoryOptionalSubjects} compulsory optional subject(s).`);
           //throw new Error(`You must select at least ${minimumCompulsoryOptionalSubjects} compulsory optional subject(s).`);
            await dispatch(addSegmentedExamSubjectFailed());
            
            return false;
        }

        console.log("totalSelectedSubjects", totalSelectedSubjects, totalSubjects);

        if (totalSelectedSubjects !== totalSubjects) {
            alert(`You must select subjects to meet the total of ${totalSubjects} subjects.`);
            await dispatch(addSegmentedExamSubjectFailed());
            return false;
        }

        // totalQuestions must be equal to totalSelectedSubjects
        if (totalQuestions !== totalQuestionsSelected) {
            alert(`You must select subjects to make question count ${totalQuestions}.`);
            await dispatch(addSegmentedExamSubjectFailed());
            return false;
        }

        await dispatch(addSegmentedExamSubject({
            examId: examId,
            studentId: student.id,
            mandatorySubjects: mandatorySubjects.map((subject) => subject.subjectId),
            compulsoryOptionalSubjects: selectedCompulsoryOptional,
            optionalSubjects: selectedOptionalSubjects,
            isPracticeExam: isPracticeExam
        }));

        return true;

    };

    useEffect(() => {
        let count = 0
        mandatorySubjects.forEach((subject) => {
            count += subject.count;
        });

        selectedCompulsoryOptional.forEach((subjectId) => {
            const subject = compulsoryOptionalSubjects.find((subject) => subject.subjectId === subjectId);
            count += subject.count;
        });

        selectedOptionalSubjects.forEach((subjectId) => {
            const subject = optionalSubjects.find((subject) => subject.subjectId === subjectId);
            if (subject) {
                count += subject.count;
            }
        });

        setTotalQuestionsSelected(count);

    }, [selectedCompulsoryOptional, selectedOptionalSubjects]);

    // Handle compulsory optional subjects selection
    const handleCompulsoryOptionalChange = (subjectId, isChecked) => {
        if (isChecked) {
            setSelectedCompulsoryOptional((prev) => [...prev, subjectId]);
        } else {
            setSelectedCompulsoryOptional((prev) => prev.filter((id) => id !== subjectId));
        }
    };

    // Handle optional subjects selection
    const handleOptionalChange = (subjectId, isChecked) => {
        if (isChecked) {
            setSelectedOptionalSubjects((prev) => [...prev, subjectId]);
        } else {
            setSelectedOptionalSubjects((prev) => prev.filter((id) => id !== subjectId));
        }
    };

    const getNameOfSubjects = (subjectId) => {
        const subject = subjects.find((subject) => subject._id === subjectId);
        return subject ? subject.name : '';
    }

    useEffect(() => {
        const getSegmentedExamSubjectData = async () => {
            try {
                const response = await dispatch(getSegmentedExamSubject({
                    examId: examId,
                    studentId: student.id
                }));

                if (response.payload) {
                    const { mandatorySubjects, compulsoryOptionalSubjects, optionalSubjects } = response.payload.data;
                    setSelectedCompulsoryOptional(compulsoryOptionalSubjects);
                    setSelectedOptionalSubjects(optionalSubjects);
                    setSubmitted(true);
                }
                console.log(response);
            } catch (error) {
                console.log(error);
            }
        }
        getSegmentedExamSubjectData();
    }, [dispatch, examId, visible, student.id]);

    useImperativeHandle(ref, () => ({
        submitSegmentedExamSubject: () => submitSegmentedExamSubject()
    }));

    return (
        <div>
            <h1>Subject Selection</h1>

            <h2>Mandatory Subjects</h2>
            <ul className='pl-0'>
                {mandatorySubjects.map((subject) => (
                    <li key={subject.subjectId} className='list-li'>
                        
                        <input type="checkbox" className='custom-checkbox-prepend pointer' checked disabled /> 
                        <span className='checkbox-icon'></span>
                        {getNameOfSubjects(subject.subjectId)} ({subject.count})
                    </li>
                ))}
            </ul>

            <h2>Compulsory Optional Subjects</h2>
            <ul className='pl-0'>
                {compulsoryOptionalSubjects.map((subject) => (
                    <li key={subject.subjectId} className='list-li'>
                        <input
                            type="checkbox"
                            className='custom-checkbox-prepend pointer'
                            disabled={!isPracticeExam && segmentedExamSubjectSelectedSubmitted}
                            checked={selectedCompulsoryOptional.includes(subject.subjectId)}
                            onChange={(e) => handleCompulsoryOptionalChange(subject.subjectId, e.target.checked)}
                        />
                         <span className='checkbox-icon'></span>
                        {getNameOfSubjects(subject.subjectId)} ({subject.count})
                    </li>
                ))}
            </ul>
            {selectedCompulsoryOptional.length < minimumCompulsoryOptionalSubjects && (
                <p style={{ color: 'red' }}>
                    You must select at least {minimumCompulsoryOptionalSubjects} compulsory optional subject(s).
                </p>
            )}

           
            {totalMandtoryCompulsoryOptional < totalSubjects && (
                <ul className='pl-0'>
                     <h2>Optional Subjects</h2>
                    {optionalSubjects.map((subject) => (
                        <li key={subject.subjectId} className='list-li'>
                            <input
                                type="checkbox"
                                 className='custom-checkbox-prepend pointer'
                                disabled={!isPracticeExam && segmentedExamSubjectSelectedSubmitted}
                                checked={selectedOptionalSubjects.includes(subject.subjectId)}
                                onChange={(e) => handleOptionalChange(subject.subjectId, e.target.checked)}
                            />
                             <span className='checkbox-icon'></span>
                            {getNameOfSubjects(subject.subjectId)} ({subject.count})
                        </li>
                    ))}
                </ul>
            )}

            <h3>Summary</h3>
            <p>Total Selected Subjects: {totalSelectedSubjects}</p>
            <p>Total Questions Selected: {totalQuestionsSelected}</p>
            {totalSelectedSubjects < totalSubjects && (
                <p style={{ color: 'red' }}>
                    You must select more subjects to meet the total of {totalSubjects} subjects.
                </p>
            )}

            {totalQuestionsSelected !== totalQuestions && (
                <p style={{ color: 'red' }}>
                    You must select subjects to make question count {totalQuestions}.
                </p>
            )}
           
            
        </div>
    );
});

export default SubjectSelection;
