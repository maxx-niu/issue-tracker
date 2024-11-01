import React from 'react';
import { Issue } from '../types';
import { FC } from 'react';
import useFetchIssues from '../hooks/useFetchIssues';

interface IssueListProps {
    
};

const IssueList: FC<IssueListProps> = () => {
    const { issues, loading, error } = useFetchIssues();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <div>
            {loading && <div>Loading...</div>}
            {error && <div>Error: {error}</div>}
            {issues.map((issue: Issue) => (
                <div key={issue.id}>
                    <h2>{issue.title}</h2>
                    <p>{issue.description}</p>
                </div>
            ))}
        </div>
    );
};

export default IssueList;