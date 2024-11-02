import { Issue } from '../types';
import { FC } from 'react';
import useFetchIssues from '../hooks/useFetchIssues';
import IssueCard from './IssueCard';


const IssueList: FC = () => {
    const { issues, loading, error } = useFetchIssues();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const openIssues = issues.filter((issue: Issue) => issue.status === 'Open');
    const inProgressIssues = issues.filter((issue: Issue) => issue.status === 'In Progress');
    const resolvedIssues = issues.filter((issue: Issue) => issue.status === 'Resolved');
    
    return (
        <div className='container-fluid px-4 pt-3'>
            <div className="row">
                <div className="col-md-4">
                    <h3>Open</h3>
                    {
                      openIssues.map((issue: Issue) => (
                        <IssueCard key={issue.id} {...issue} />
                      ))
                    }
                </div>
                <div className="col-md-4">
                    <h3>In Progress</h3>
                    {
                      inProgressIssues.map((issue: Issue) => (
                        <IssueCard key={issue.id} {...issue} />
                      ))
                    }
                </div>
                <div className="col-md-4">
                    <h3>Resolved</h3>
                    {
                      resolvedIssues.map((issue: Issue) => (
                        <IssueCard key={issue.id} {...issue} />
                      ))
                    }
                </div>
            </div>
        </div>
    );
};

export default IssueList;