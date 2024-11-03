import { FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/IssueCreator.css";

const IssueCreator: FC = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: '',
        status: '',
    });

    const navigate = useNavigate();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData({
        ...formData,
        [name]: value,
        });
    };

    const muteText = (selectedPriority: string) => {
        if (selectedPriority === '') {
            return 'text-muted';
        }
        return '';
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const { title, description, priority, status } = formData;

        if (!title || !description || !priority) {
            alert('Please fill out all required fields.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/issues/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description, priority, status: status === '' ? 'Open' : status }),
            });

            if (!response.ok) {
                throw new Error('Failed to create issue');
            }

            const result = await response.json();
            alert(`${result.message}`);
            navigate('/'); // Navigate back to the home page
        } catch (error) {
            console.error(error);
            alert('Error creating issue');
        }
    };
    
    return (
    <div className="container-fluid d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Link to="/" className="btn btn-primary back-button">
            <i className="bi bi-chevron-left chevron-left"></i>Back to issues
        </Link>
        <div className='card issue-creator'>
            <h2 className="card-header">
                Create an Issue
            </h2>
            <form className='card-body' onSubmit={handleSubmit}>
                <div className="form-group mt-3">
                    <label htmlFor="titleInput">Issue Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="titleInput"
                        name="title"
                        placeholder="Enter issue title (required)"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group mt-3">
                    <label htmlFor="descriptionInput">Description</label>
                    <textarea
                        className="form-control"
                        id="descriptionInput"
                        name="description"
                        placeholder="Enter issue description (required)"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        required
                    />
                </div>
                <div className="form-group mt-3">
                    <label htmlFor="priorityInput">Priority Level</label>
                    <select
                        className={`form-select ${muteText(formData.priority)}`}
                        id="priorityInput"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                    >
                        <option value="" selected disabled className="text-muted">Select priority level (required)</option>
                        <option value="Low" className="text-body">Low</option>
                        <option value="Medium" className="text-body">Medium</option>
                        <option value="High" className="text-body">High</option>
                    </select>
                </div>
                <div className="form-group mt-3">
                    <label htmlFor="statusInput">Status</label>
                    <select
                        className={`form-select ${muteText(formData.status)}`}
                        id="statusInput"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="" selected disabled className="text-muted">Select status (default: Open)</option>
                        <option value="Open" className="text-body" >Open</option>
                        <option value="In Progress" className="text-body">In Progress</option>
                        <option value="Resolved" className="text-body">Resolved</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary mt-3">Create Issue</button>
            </form>
        </div>
    </div>
    )
};

export default IssueCreator;