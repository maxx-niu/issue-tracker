import { ChangeEvent, FC, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useFetchIssue from "../hooks/useFetchIssue";

const IssueViewer: FC = () => {
    const { id } = useParams<{ id: string }>();
    const { issue, loading, error, setIssue } = useFetchIssue(id);
    const [selectValue, setSelectValue] = useState<string>("");

    useEffect(() => {
        if (issue) {
            setSelectValue(issue.status);
        }
    }, [issue]);

    const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectValue(e.target.value);
    };

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!issue) return <div>No issue found</div>;

    const isStatusChanged = issue.status !== selectValue;

    return (
        <div>
            <Link to="/">Back to issues</Link>
            <h2>{issue.title}</h2>
            <p>{issue.description}</p>
            <div>
                <label htmlFor="status-select">Status</label>
                <select id="status-select" value={selectValue} onChange={handleStatusChange}>
                    <option value="Open">Open {issue.status === "Open" && "✔"}</option>
                    <option value="In Progress">In Progress {issue.status === "In Progress" && "✔"}</option>
                    <option value="Resolved">Resolved {issue.status === "Resolved" && "✔"}</option>
                </select>
            </div>
            {isStatusChanged && <button onClick={handleUpdateStatus}>Update Status</button>}
            <p>Status: {issue.status}</p>
            <p>Priority: {issue.priority}</p>
            <p>Created At: {issue.created_at}</p>
            {issue.updated_at && <p>Last Updated At: {issue.updated_at}</p>}
        </div>
    );
};

export default IssueViewer;
