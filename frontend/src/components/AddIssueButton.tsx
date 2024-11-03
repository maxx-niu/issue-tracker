import React from 'react';
import { FC } from 'react';
import '../styles/AddIssueButton.css';
import { Link } from 'react-router-dom';

const AddIssueButton: FC = () => {
  return (
    <Link to="/create" className="text-decoration-none">
        <button className="btn btn-primary add-issue-button">
        <i className="bi bi-plus-lg me-2"></i>
        Add Issue
        </button>
    </Link>
  )
};

export default AddIssueButton;