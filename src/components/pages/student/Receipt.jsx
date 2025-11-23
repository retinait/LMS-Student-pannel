import React from "react";
import { useReactToPrint } from "react-to-print";
// import QRCode from "qrcode"; // (kept for parity with older commented feature)
import styles from "./Receipt.module.css";
import { Button, Switch } from "antd";
import { PrinterFilled, CopyOutlined } from "@ant-design/icons";
import moment from "moment";
import { useLocation } from "react-router-dom";

const Receipt = ({
    studentName = "N/A",
    serialNo = "11212232XXXX",
    date = "N/A",
    programCode = "N/A",
    branch = "N/A",
    assignedBatch = "N/A",
    batchDay = "N/A",
    batchTime = "N/A",
    books,
    enrolledCourse = "N/A",
    amount = 0,
    discount = 0,
    appliedDiscount,
    couponCode,
    paid = 0,
    receivedAmount = 0,
    dueAmount = 0,
    dueDate = "N/A",
    amountInWords = "N/A",
    method,
    trxID,
    payments = [],
    // Publications compatibility (various prop names + URL flags)
    hasPublications,
    hasPublication,
    publications,
    publication,
    publicationCount,
}) => {
    const componentRef = React.useRef(null);
    const contentRootRef = React.useRef(null);

    const [printWithHeader, setPrintWithHeader] = React.useState(true);

    // NEW: show title bar even if header is off (user-toggle)
    const [showTitleWithoutHeader, setShowTitleWithoutHeader] = React.useState(true);


    // Keep currentUrl & commented QR logic for parity
    const [currentUrl, setCurrentUrl] = React.useState("");
    React.useEffect(() => {
        if (typeof window !== "undefined") setCurrentUrl(window.location.href);
    }, []);
    // const [qrCodeBase64, setQrCodeBase64] = React.useState("");
    // React.useEffect(() => {
    //   QRCode.toDataURL(currentUrl, { width: 100 }, function (err, url) {
    //     if (!err) setQrCodeBase64(url);
    //   });
    // }, [currentUrl]);

    // Publications: robust detection incl. URL flags (?pub=1, ?hasPublications=true)
    const { search } = useLocation();
    const qs = new URLSearchParams(search);
    const pubQS =
        qs.get("pub") ??
        qs.get("publication") ??
        qs.get("publications") ??
        qs.get("hasPublication") ??
        qs.get("hasPublications");

    const rawPub =
        (typeof hasPublications !== "undefined" ? hasPublications :
            typeof hasPublication !== "undefined" ? hasPublication :
                typeof publications !== "undefined" ? publications :
                    typeof publication !== "undefined" ? publication :
                        typeof publicationCount !== "undefined" ? publicationCount : pubQS);

    const showPublications = (() => {
        if (rawPub === true) return true;
        if (typeof rawPub === "number") return rawPub > 0;
        if (typeof rawPub === "string") {
            const s = rawPub.trim();
            if (/^(yes|true|1)$/i.test(s)) return true;
            const n = Number(s);
            if (!Number.isNaN(n)) return n > 0;
        }
        return false;
    })();

    // Version / Type ticks (match Admission form rules)
    const isEnglish = /english|english version|\bev\b/i.test(String(enrolledCourse || ""));
    const isOnline = /online/i.test(String(branch || ""));

    const Tick = ({ on }) => <span className={styles.tick}>{on ? "✓" : ""}</span>;

    const handleAfterPrint = React.useCallback(() => {
        // Clean up after any print (single or both)
        try { contentRootRef.current?.classList.remove("no-print-header"); } catch { }
    }, []);

    const handleBeforePrint = React.useCallback(() => Promise.resolve(), []);

    const printFn = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "Receipt",
        onAfterPrint: handleAfterPrint,
        onBeforePrint: handleBeforePrint,
        pageStyle: `
      @media print {
        .no-print { display: none !important; }
        .print-hide-header { visibility: hidden !important; }
        [data-print-header="off"] .print-header { display: none !important; }
        /* ↓ reduced by ~40px from previous 170px to 130px */
        [data-print-header="off"] .print-header-spacer { display: block !important; height: 130px; }
        .no-print-header .print-header { display: none !important; }
        .no-print-header .print-header-spacer { display: block !important; height: 130px; }
      }
    `,
    });

    // Single copy print
    const startPrint = () => {
        if (!printWithHeader) contentRootRef.current?.classList.add("no-print-header");
        else contentRootRef.current?.classList.remove("no-print-header");
        printFn();
    };



    // === Extracted body renderer so we can reuse it for Office/Student in dual mode ===
    const TitleBar = ({ copyLabel }) => (
        <div className={styles.standaloneTitleWrap}>
            <div className={styles.receiptTitle}>
                Receipt of Payment (Student Copy)
            </div>
        </div>
    );

    const HeaderWithTitle = ({ copyLabel }) => (
        <div
            className={`${styles.header} print-header ${printWithHeader ? "" : "print-hide-header"}`}
            style={{ visibility: printWithHeader ? "visible" : "hidden" }}
        >
            <div className={styles.headerImg}><img src="/logo.svg" alt="Retina" /></div>
            <p className="text-gray-600">Medical & Dental Admission Coaching</p>
            <p className="text-gray-600 text-sm">www.retinabd.org | Hotline: 09677 999 666</p>
            {/* Title inside header so pre-printed paper can include it */}
            <div className={styles.receiptTitle}>
                Receipt of Payment
                <span>{copyLabel ? (copyLabel === "Office" ? " (Office Copy)" : " (Student Copy)") : ""}</span>
            </div>
        </div>
    );

    const ReceiptBody = ({ copyLabel }) => (
        <>
            {/* Header (three lines + centered Title; space preserved when hidden) */}
            <HeaderWithTitle copyLabel={copyLabel} />
            <div className="print-header-spacer" />

            {/* If header is OFF, optionally show a minimal title line below spacer */}
            {!printWithHeader && showTitleWithoutHeader && <TitleBar copyLabel={copyLabel} />}

            {/* Serial + Date (same line, just under header/title) */}
            <div className={styles.serialDateRow}>
                <div><span>Serial No:</span><span className={styles.Values}>{serialNo}</span></div>
                <div><span>Date:</span><span className={styles.Values}>{moment(date).format("DD MMM, YYYY")}</span></div>
            </div>

            {/* ======= Info Section: 4 rows — 2 / 2 / 2 / 3 ======= */}
            <div className={styles.infoGridWrap}>

                {/* Row 1: 2 cols — Name | Coaching Code */}
                <div className={`${styles.infoRow} ${styles.cols2}`}>
                    <div className={styles.noWrapValue}>
                        <span>Name:</span> <span className={styles.Values}>{studentName}</span>
                    </div>
                    <div className={styles.noWrapValue}>
                        <span>Coaching Code:</span> <span className={`${styles.Values} ${styles.nowrapSm}`}>{programCode}</span>
                    </div>
                </div>

                {/* Row 2: 2 cols — Branch | Batch */}
                <div className={`${styles.infoRow} ${styles.cols2}`}>
                    <div><span>Branch:</span> <span className={styles.Values}>{branch}</span></div>
                    <div className={styles.noWrapValue}><span>Batch:</span> <span className={styles.Values}>{assignedBatch}</span></div>
                </div>

                {/* Row 3: 2 cols — Batch Day | Batch Time */}
                <div className={`${styles.infoRow} ${styles.cols2}`}>
                    <div><span>Batch Day:</span> <span className={styles.Values}>{batchDay}</span></div>
                    <div className={styles.noWrapValue}><span>Batch Time:</span> <span className={styles.Values}>{batchTime}</span></div>
                </div>

                {/* Row 4: 3 cols — Version | Type | Publications */}
                <div className={`${styles.infoRow} ${styles.cols3} ${styles.ticksRow}`}>
                    <div className={styles.ticksCell}>
                        <span className={styles.ticksTitle}>Version:</span>
                        <span className={styles.flag}><Tick on={!isEnglish} /> Bangla</span>
                        <span className={styles.flag}><Tick on={isEnglish} /> English</span>
                    </div>
                    <div className={styles.ticksCell}>
                        <span className={styles.ticksTitle}>Type:</span>
                        <span className={styles.flag}><Tick on={isOnline} /> Online</span>
                        <span className={styles.flag}><Tick on={!isOnline} /> Offline</span>
                    </div>
                    <div className={styles.ticksCell}>
                        {showPublications && (
                            <>
                                <span className={styles.ticksTitle}>Publications:</span>
                                <span className={styles.flag}><Tick on /> Yes</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* ======= /Info Section ======= */}

            {/* Course table */}
            <div className={styles.table}>
                <table>
                    <thead>
                        <tr>
                            <th>Serial</th>
                            <th colSpan={4}>Enrolled Course</th>
                            <th>Amount (TK)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>01.</td>
                            <td colSpan={4}>{enrolledCourse}</td>
                            <td>{amount}/-</td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "right", fontWeight: "bold" }} colSpan={5}>Total Amount:</td>
                            <td>{amount}/-</td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: "right", fontWeight: "bold" }} colSpan={5}>Discount:</td>
                            <td>{discount}/-</td>
                        </tr>
                        {couponCode && (
                            <tr>
                                <td style={{ fontWeight: "bold" }} colSpan={2}>Coupon Code:</td>
                                {/* Mask the actual code for security */}
                                <td colSpan={2}><span className={styles.mask}>••••••••</span></td>
                                <td style={{ textAlign: "right", fontWeight: "bold" }}>Coupon Discount:</td>
                                <td>{appliedDiscount}/-</td>
                            </tr>
                        )}
                        <tr>
                            <td style={{ textAlign: "right", fontWeight: "bold" }} colSpan={5}>Total Payable Amount:</td>
                            <td>{amount - discount - (appliedDiscount ?? 0)}/-</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Payments */}
            {Array.isArray(payments) && payments.length > 0 && (
                <div className={styles.paymentsTable}>
                    <table>
                        <thead>
                            <tr>
                                <th>Payment Date</th>
                                <th>Payment Method</th>
                                <th>Trxn ID</th>
                                <th>Paid Amount (TK)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((p) => (
                                <tr key={p._id}>
                                    <td>{new Date(p.transaction?.executeTime).toLocaleDateString()}</td>
                                    <td>{p.transaction?.paymentMethod}</td>
                                    <td>{p.transaction?.trxID || "N/A"}</td>
                                    <td>{p.transaction?.amount}/-</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Totals */}
            <div className={styles.amountGrid}>
                <div><span>Received Amount:</span><span className={styles.Values}>{paid}/-</span></div>
                <div><span>Due Amount:</span><span className={styles.Values}>{dueAmount}/-</span></div>
                <div><span>Due Payment Date:</span><span className={styles.Values}>{dueDate || "N/A"}</span></div>
            </div>

            <div className={styles.amountInWords}>
                <span>Received Amount (In Word):</span>
                <span className={styles.Values}>{amountInWords} Taka Only</span>
            </div>

            {/* Kit Distribution (books) */}
            {books && books.length > 0 && (
                <div className={styles.paymentsTable}>
                    <table>
                        <thead>
                            <tr><th>SL.</th><th>Kit Name</th><th>Distributor (ID)</th><th>Distributed On</th></tr>
                        </thead>
                        <tbody>
                            {books.map((bk, idx) => (
                                <tr key={bk._id}>
                                    <td>{idx + 1}</td>
                                    <td>{bk.book?.name}</td>
                                    <td>
                                        {bk.distributor?.firstName} {bk.distributor?.lastName}
                                        {bk.distributor?.adminId ? ` (${bk.distributor?.adminId})` : " (Super)"}
                                    </td>
                                    <td>{moment(bk.distributedAt).format("DD MMM yyyy HH:mm A")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Signatures */}
            {/* <div className={styles.signArea}>
                <div className={styles.sigBox}>
                    <div className={styles.sigLine} />
                    <div className={styles.sigLabel}>Accounts</div>
                </div>
                <div className={styles.sigBox}>
                    <div className={styles.sigLine} />
                    <div className={styles.sigLabel}>Office Executive</div>
                </div>
            </div> */}

            <div className={styles.footer}>
                <p>(Online generated. Doesn't need signatures)</p>
                <p>Admission cannot be cancelled & coaching fee is not refundable</p>
            </div>
        </>
    );

    return (
        <div ref={componentRef} className={`${styles.container} print-teacher`}>
            {/* Controls (won’t print) */}
            <div className={styles.controls} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <Button
                        className="no-print"
                        size="large"
                        style={{ backgroundColor: "grey", color: "white", borderRadius: 4, marginRight: 8 }}
                        icon={<PrinterFilled />}
                        onClick={() => { 
                            window.history.back();                            
                         }}
                    >
                        Go Back
                    </Button>
                </div>
                {/* <span className="no-print" style={{ fontWeight: 700, fontSize: 12, marginRight: 8 }}>
                    Print header:
                </span>
                <Switch
                    className="no-print"
                    checked={printWithHeader}
                    onChange={setPrintWithHeader}
                    style={{ marginRight: 12 }}
                />

                <span className="no-print" style={{ fontWeight: 700, fontSize: 12, marginRight: 8 }}>
                    Show title when header off:
                </span>
                <Switch
                    className="no-print"
                    checked={showTitleWithoutHeader}
                    onChange={setShowTitleWithoutHeader}
                    style={{ marginRight: 12 }}
                /> */}

                <div>
                    <Button
                        className="no-print"
                        size="large"
                        style={{ backgroundColor: "green", color: "white", borderRadius: 4, marginRight: 8 }}
                        icon={<PrinterFilled />}
                        onClick={() => { startPrint(); }}
                    >
                        Print Receipt
                    </Button>
                </div>
            </div>

            {/* Printable root */}
            <div
                className={styles.content}
                data-print-header={printWithHeader ? "on" : "off"}
                ref={contentRootRef}
            >

                <ReceiptBody copyLabel={"Student"} />
            </div>
        </div>
    );
};

export default Receipt;
