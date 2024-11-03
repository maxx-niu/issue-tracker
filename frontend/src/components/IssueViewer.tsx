import { FC, useEffect, useState } from "react";
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { useParams, Link, useNavigate } from "react-router-dom";
import useFetchIssue from "../hooks/useFetchIssue";
import { convertToUserTime } from "../utils";
import { priorityColor } from "../utils";
import "../styles/IssueViewer.css";

const IssueViewer: FC = () => {
    const { id } = useParams<{ id: string }>();
    const { issue, loading, error, setIssue } = useFetchIssue(id);
    const [selectValue, setSelectValue] = useState<string>("");

    useEffect(() => {
        if (issue) {
            setSelectValue(issue.status);
        }
    }, [issue]);

    const handleStatusChange = (newStatus: string | null) => {
        if (newStatus) {
            setSelectValue(newStatus);
        }
    };

    const navigate = useNavigate();

    const handleUpdateStatus = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/issues/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ newStatus: selectValue })
            });

            if (!response.ok) {
                throw new Error("Failed to update status");
            }

            const updateRes = await response.json();
            const updatedIssue = updateRes.issue;
            alert(`Status updated to ${updatedIssue.status}`);
            setIssue(updatedIssue);
        } catch (err) {
            console.error(err);
            alert("Error updating status");
        }
    };

    const handleDeleteIssue = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/issues/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Failed to delete issue");
            }

            alert("Issue deleted successfully");
            navigate('/');
        } catch (err) {
            console.error(err);
            alert("Error deleting issue");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!issue) return <div>No issue found</div>;

    const isStatusChanged = issue.status !== selectValue;

    return (
         <div className="container-fluid d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <Link to="/" className="btn btn-primary back-button">
                <i className="bi bi-chevron-left chevron-left"></i>Back to issues
            </Link>
            <div className="card issue-displayer">
                <h2 className="card-header">
                    {issue.title}
                </h2>
                <div className="card-body p-4">
                    <h6 className="card-subtitle mb-2">
                        Details:
                    </h6>
                    <p>{issue.description}</p>
                    <div className="status-container mb-3 d-flex align-items-center">
                        <label className="me-2 fw-semibold">Status:</label>
                        <DropdownButton 
                            id="statusDropdown" 
                            title={selectValue} 
                            onSelect={handleStatusChange}
                            variant="outline-secondary"
                            className="bg-transparent border-0 me-2"
                        >
                            <Dropdown.Item eventKey="Open">
                                Open {issue.status === "Open" && "✔"}
                            </Dropdown.Item>
                            <Dropdown.Item eventKey="In Progress">
                                In Progress {issue.status === "In Progress" && "✔"}
                            </Dropdown.Item>
                            <Dropdown.Item eventKey="Resolved">
                                Resolved {issue.status === "Resolved" && "✔"}
                            </Dropdown.Item>
                        </DropdownButton>
                        {isStatusChanged && <button onClick={handleUpdateStatus} className="btn btn-primary">Update Status</button>}
                    </div>
                    <div className="mb-3 fw-semibold">
                        Priority: <span className={`badge ${priorityColor(issue.priority)} fw-normal`}>{issue.priority}</span>
                    </div>
                    <div onClick={handleDeleteIssue} className="btn btn-danger mt-3">Delete Issue</div>
                </div>
                <div className="card-footer text-muted small">
                    <p>Created At: {convertToUserTime(issue.created_at)}</p>
                    {issue.updated_at && <p>(Updated: {convertToUserTime(issue.updated_at)})</p>}
                </div>
            </div>
        </div>
    );
};

export default IssueViewer;
