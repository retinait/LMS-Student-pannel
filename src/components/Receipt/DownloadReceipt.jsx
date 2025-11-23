import { use, useEffect, useState } from "react";
import { instance } from "../../constants/constString";
import { useParams } from "react-router-dom";
import Receipt from "../pages/student/Receipt";
import { Layout } from "antd";


const ReceiptGenerator = () => {

    const { courseId } = useParams();
    const searchParams = new URLSearchParams(window.location.search);
    const student = searchParams.get('student') || student;
    const [payments, setPayments] = useState([])
    console.log("courseId", courseId, "student", student);


    const [formData, setFormData] = useState(null);



    useEffect(() => {
        const getCourseDetails = async (id) => {

            const response = await instance.post("/admission/receipt/data", { student: student, course: id });
            const { data } = response;
            setFormData({ ...data.data, type: "Course" });
        }
        const getAllPayments = async (student, course) => {

            const res = await instance.post("/admission/transactions/data", { student, course })

            if (res.data.status === '200') {
                setPayments(res.data.data)
            }
        }
        if (courseId) {
            getAllPayments(student, courseId)
            getCourseDetails(courseId);
        }
    }, [courseId, student]);


    return (
        <Layout>
            <div style={{ padding: "40px" }}>
                <div style={{ backgroundColor: 'white' }}>
                    {/* Displaying the receipt */}
                    {formData && <Receipt
                        {...formData} payments={payments}
                    />}
                </div>
            </div>
        </Layout>
    );
};

export default ReceiptGenerator;
