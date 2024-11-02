import React, { FC } from "react";
import { Issue } from "../types";
import { Link } from "react-router-dom";
import "../styles/IssueCard.css";

const IssueCard: FC<Issue> = (issue: Issue) => {

    const priorityColor = (priority: string) => {
        switch (priority) {
            case "Low":
                return "bg-success";
            case "Medium":
                return "bg-warning";
            default:
                return "bg-danger";
        };
    };

    return (
        <Link to={`/issues/${issue.id}`} className="text-decoration-none">
        <div className="card my-3 mx-2 card-hover">
            <h5 className="card-header">
                {issue.title}
            </h5>
            <div className="card-body">
                <h6 className="card-subtitle mb-2">
                    Details:
                </h6>
                <p className="card-text text-muted">{issue.description}</p>
                <div>
                    <span className={`badge ${priorityColor(issue.priority)}`}>{issue.priority}</span>
                </div>
            </div>
            <div className="card-footer">
                {issue.updated_at ? `Updated: ${issue.updated_at}` : `Created: ${issue.created_at}`}
            </div>
        </div>
        </Link>
    );
};

export default IssueCard;