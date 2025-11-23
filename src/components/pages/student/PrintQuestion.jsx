import { Card, Col } from 'antd';
import React from 'react';
import { ReactComponent as Logo } from '../../../assets/images/logo.svg';
import moment from 'moment';
const PrintQuestion = (props) => {
    const { liveExam, studentProfile, examResult } = props;
    console.log('liveExam', liveExam,  studentProfile, examResult);
    const timeTaken = (startsAt, submittedAt) => {
		if (startsAt && submittedAt) {
			const submitMoment = moment(submittedAt);
			const startMoment = moment(startsAt);

			// Getting the difference: hours (h), minutes (m) and seconds (s)
			let h = submitMoment.diff(startMoment, 'hours');
			let m = submitMoment.diff(startMoment, 'minutes') - 60 * h;
			let s = submitMoment.diff(startMoment, 'seconds') - 60 * 60 * h - 60 * m;

			// Formating in hh:mm:ss (appends a left zero when num < 10)
			let hh = ('0' + h).slice(-2);
			let mm = ('0' + m).slice(-2);
			let ss = ('0' + s).slice(-2);

			return `${hh}:${mm}:${ss}`;
		}
		return 0;
	};
    return (
        <Col xs={24} className='question-table'>
            <Card style={{ width: '100%', borderRadius: 0 , border:'1px solid black', fontFamily:'serif'}}>
                <div style={{minHeight:'calc(100vh - 68px)',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                    <div>
                        <div className="logo-section" style={{textAlign:'center'}}>
                            <Logo />
                        </div>
                        <div style={{display:'flex', alignItems:'center',gap:'20px',marginBottom:'20px'}}>
                            <div className="box" style={{minWidth:'250px',border:'1px solid black',padding:'5px'}}>
                                <div>Roll: {studentProfile?.sid}</div>
                                <div>Branch: {`${studentProfile?.branch?.name} ( ${studentProfile?.branch?.division} )`}</div>
                                <div>Name: {studentProfile?.name}</div>
                            </div>
                            <div style={{textTransform:'uppercase',fontSize:'30px'}}>Progress Report</div>
                        </div>
                        <div style={{display:'flex', alignItems:'center',gap:'20px',marginBottom:'20px',justifyContent:'space-between',border:'1px solid black',padding:'5px'}}>
                            <div style={{display:'flex',flexDirection:'column',gap:'10px',flex:'1'}}>
                                <div>Total Marks: {liveExam?.totalMarks}</div>
                                <div>Total Marks Obtained: {liveExam?.totalMarksObtained}</div>
                            </div>
                            <div style={{display:'flex',flexDirection:'column',gap:'10px',flex:'1'}}>
                                <div>Total Exams: {liveExam?.totalExamCount}</div>
                                <div>Average Marks: {Number(liveExam?.averageMarkObtained).toFixed(2)}</div>
                            </div>
                            <div style={{display:'flex',flexDirection:'column',gap:'10px',flex:'1'}}>
                                <div>Highest Marks: {liveExam?.maxMarkObtained}</div>
                                {/* <div>Rank: {'750'}</div> */}
                            </div>
                        </div>
                        <table className=''>
                            <thead><tr>
                                <th>SN</th>
                                <th>Exam Date</th>
                                <th>Exam Name</th>
                                <th>Pass/Fail</th>
                                <th>Total Marks</th>
                                <th>Obtained Marks</th>
                                <th>Negative Marks</th>
                                <th>Merit Position</th>
                                <th>Completion</th>
                            </tr></thead>
                            
                            {
                                examResult?.map((item,index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index+1}</td>
                                            <td>{new Date(item?.startsAt).toLocaleDateString()}</td>
                                            <td>{item?.examId?.title}</td>
                                            <td><span className={
                                                        (item?.marksObtained * 100) / item?.examId?.totalMarks >=
                                                        item?.examId?.passMark
                                                            ? 'table-center-text is-success'
                                                            : 'table-center-text is-error'
                                                    }>
                                                        {(item?.marksObtained * 100) / item?.examId?.totalMarks >=
                                                        item?.examId?.passMark
                                                            ? 'PASS'
                                                            : 'FAIL'}
				                                </span>
                                        </td>
                                            <td>{item?.examId?.totalMarks}</td>
                                            <td>{item?.marksObtained}</td>
                                            <td>{item?.negativeMarks}</td>
                                            <td>{item?.rank}</td>
                                            <td>{timeTaken(item?.startsAt, item?.submittedAt)}</td>
                                        </tr>
                                    )
                                })
                            }
                        </table>
                        <table>
                            <tfoot>
                                <tr>
                                    <td colSpan='9' style={{textAlign:'center',border:'none',paddingLeft:'0px',paddingRight:'0px'}}>
                                        <div style={{display:'flex',gap:'20px',textAlign:'left'}} className=''>
                                            <div style={{border:'1px solid black',borderRadius:'10px',flex:'1',padding:'10px',height:'200px'}}>
                                                <div style={{fontSize:'20px'}}>Teacher’s Comment & Signature:</div>
                                            </div>
                                            <div style={{border:'1px solid black',borderRadius:'10px',flex:'1',padding:'10px',height:'200px'}}>
                                                <div style={{fontSize:'20px'}}>Guardian’s Comment & Signature:</div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </Card>
        </Col>
    );
};

export default PrintQuestion;