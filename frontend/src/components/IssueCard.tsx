import { FC } from "react";
import { Issue } from "../types";
import { Link } from "react-router-dom";
import { convertToUserTime, priorityColor } from "../utils";
import "../styles/IssueCard.css";

const IssueCard: FC<Issue> = (issue: Issue) => {

    const truncatedDescription = issue.description.length > 100
    ? issue.description.substring(0, 100) + "..."
    : issue.description;

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
                    <p className="card-text text-muted">{truncatedDescription}</p>
                    <div>
                        <span className={`badge ${priorityColor(issue.priority)}`}>{issue.priority}</span>
                    </div>
                </div>
                <div className="card-footer text-muted small">
                    {issue.updated_at ? `Last Updated: ${convertToUserTime(issue.updated_at)}` : `Created: ${convertToUserTime(issue.created_at)}`}
                </div>
            </div>
        </Link>
    );
};

export default IssueCard;