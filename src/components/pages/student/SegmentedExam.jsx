import React, { useState } from 'react';

const SubjectSelection = () => {
    const [mandatorySubjects] = useState([
        { subjectId: "63b7f2397c9d090b54d70908", count: 1 },
        { subjectId: "63b7f2757c9d090b54d70927", count: 1 },
    ]);
    const [compulsoryOptionalSubjects] = useState([
        { subjectId: "63b7f291e911c50b5db60025", count: 1 },
    ]);
    const [optionalSubjects] = useState([
        { subjectId: "63b7f2997e111c50b5db60123", name: "Optional 1" },
        { subjectId: "63b7f2997e111c50b5db60124", name: "Optional 2" },
    ]);

    const [selectedCompulsoryOptional, setSelectedCompulsoryOptional] = useState([]);
    const [selectedOptionalSubjects, setSelectedOptionalSubjects] = useState([]);

    const totalSubjects = 3;
    const minimumCompulsoryOptionalSubjects = 1;

    // Calculate the total selected subjects count
    const totalSelectedSubjects = mandatorySubjects.length + selectedCompulsoryOptional.length + selectedOptionalSubjects.length;

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

    return (
        <div>
            <h1>Subject Selection</h1>

            <h2>Mandatory Subjects</h2>
            <ul>
                {mandatorySubjects.map((subject) => (
                    <li key={subject.subjectId}>
                        <input type="checkbox" checked disabled /> {subject.subjectId} (Pre-selected)
                    </li>
                ))}
            </ul>

            <h2>Compulsory Optional Subjects</h2>
            <ul>
                {compulsoryOptionalSubjects.map((subject) => (
                    <li key={subject.subjectId}>
                        <input
                            type="checkbox"
                            checked={selectedCompulsoryOptional.includes(subject.subjectId)}
                            onChange={(e) => handleCompulsoryOptionalChange(subject.subjectId, e.target.checked)}
                        />
                        {subject.subjectId}
                    </li>
                ))}
            </ul>
            {selectedCompulsoryOptional.length < minimumCompulsoryOptionalSubjects && (
                <p style={{ color: 'red' }}>
                    You must select at least {minimumCompulsoryOptionalSubjects} compulsory optional subject(s).
                </p>
            )}

            <h2>Optional Subjects</h2>
            {totalSelectedSubjects < totalSubjects && (
                <ul>
                    {optionalSubjects.map((subject) => (
                        <li key={subject.subjectId}>
                            <input
                                type="checkbox"
                                checked={selectedOptionalSubjects.includes(subject.subjectId)}
                                onChange={(e) => handleOptionalChange(subject.subjectId, e.target.checked)}
                            />
                            {subject.name}
                        </li>
                    ))}
                </ul>
            )}

            <h3>Summary</h3>
            <p>Total Selected Subjects: {totalSelectedSubjects}</p>
            {totalSelectedSubjects < totalSubjects && (
                <p style={{ color: 'red' }}>
                    You must select more subjects to meet the total of {totalSubjects} subjects.
                </p>
            )}
        </div>
    );
};

export default SubjectSelection;
