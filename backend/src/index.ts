import express, { Request, Response } from "express";
import dotenv from "dotenv";
import db from "./database";
import { Issue, IssueDetails } from "./types";
import { getFormattedDate } from "./utils";

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT;
const VALIDSTATUSES = ["Open", "In Progress", "Resolved"];
const VALIDPRIORITIES = ["Low", "Medium", "High"];
const REQUESTLIMIT = 100;

app.listen(PORT, () => {
    console.log("Server running at PORT: ", PORT);
}).on("error", (error) => {
    throw new Error(error.message);
});

/**
 * GET /api/issues
 * 
 * Retrieves a paginated list of all issues. A maximum of 100 issues
 * may be returned per API call.
 * 
 * Query Parameters:
 * - page (number): Optional. The page number to retrieve. Defaults to 1.
 * - limit (number): Optional. Number of issues per page. Defaults to 25.
 * 
 * Success Response:
 * - 200 OK: Returns an object containing:
 *   - issues: Array of Issue objects
 *   - pagination: Object containing page info:
 *     - page: Current page number
 *     - pageLimit: Number of items per page
 *     - totalCount: Total number of issues
 *     - totalPages: Total number of pages
 * 
 * Error Response:
 * - 400: Bad Request: Too many issues requested.
 * - 500 Internal Server Error: If there was an error fetching issues from the database.
 */
app.get("/api/issues", (req: Request, res: Response) => { 
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 25;
        if (limit > REQUESTLIMIT){
            res.status(400).json({message: "Too many issues requested"});
            return;
        }
        const offset = (page - 1) * limit;

        const stmt = db.prepare("SELECT * FROM issues LIMIT ? OFFSET ?");
        const issues: Issue[] = stmt.all(limit, offset) as Issue[];

        const countStmt = db.prepare("SELECT COUNT(*) AS count FROM issues");
        const totalCount = (countStmt.get() as { count: number }).count;

        res.status(200).json({
            issues,
            pagination: {
                page,
                pageLimit: limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: "An error occurred while fetching issues.",
            error: (error as Error).message
        });
    }
});

/**
 * GET /api/issues/:id
 * 
 * Retrieves a single issue by its ID.
 * 
 * URL Parameters:
 * - id (number): Required. The ID of the issue to retrieve.
 * 
 * Success Response:
 * - 200 OK: Returns the requested Issue object.
 * 
 * Error Response:
 * - 400 Bad Request: If the ID is invalid or the issue was not found.
 * - 500 Internal Server Error: If there was an error fetching the issue from the database.
 */
app.get("/api/issues/:id", (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)){
            res.status(400).json({message: "Invalid ID"});
            return;
        }
        const stmt = db.prepare("SELECT * FROM issues WHERE id = ?");
        const issue = stmt.get(id) as Issue | undefined;
        
        if (!issue) {
            res.status(404).json({message: `Issue ID ${id} not found.`});
            return;
        }

        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while creating the issue",
            error: (error as Error).message
        });
    }
});

/**
 * POST /api/issues
 * 
 * Creates a new issue by writing to local DB.
 * 
 * Request Body:
 * - title (string): Required. The title of the issue.
 * - description (string): Required. The description of the issue.
 * - priority (string): Required. One of "Low", "Medium", "High".
 * - status (string): Optional. One of "Open", "In Progress", "Resolved". Defaults to "Open".
 * 
 * Success Response:
 * - 201 Created: Returns the newly created issue object.
 * 
 * Error Response:
 * - 400 Bad Request: If required fields are missing or invalid.
 * - 500 Internal Server Error: If there was an error creating the issue in the database.
 */
app.post("/api/issues/create", (req: Request, res: Response) => {
    const {
        title,
        description,
        priority,
        status = "Open"
    }: IssueDetails = req.body;

    // input checking:
    // title, description, and priority are required and cannot be empty
    // title cannot start with a whitespace
    if (typeof title !== "string" || title.trim() === "") {
        res.status(400).json({
            message: "Title is required and cannot be empty."
        });
        return;
    }
    if (title !== title.trimStart()){
        res.status(400).json({
            message: "Title cannot start with whitespace."
        });
        return;
    }
    if (typeof description !== "string" || description.trim() === "") {
        res.status(400).json({
            message: "Description required and cannot be empty"
        });
        return;
    }
    // check for inproper priorities and statuses
    if (!VALIDPRIORITIES.includes(priority)) {
        res.status(400).json({
            message: "Invalid priority. Must be 'Low', 'Medium' or 'High'."
        });
        return;
    }
    if (!VALIDSTATUSES.includes(status)) {
        res.status(400).json({
            message: "Invalid status. Must be 'Open', 'In Progress', or 'Resolved'"
        });
        return;
    }
    try {
        const stmt = db.prepare("INSERT INTO issues (title, description, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
        const timestamp = getFormattedDate();
        const result = stmt.run(title, description, status, priority, timestamp, null);
        const returnIssue: Issue = {
            id: result.lastInsertRowid as number,
            title,
            description,
            status,
            priority,
            created_at: timestamp,
            updated_at: null
        };

        if (result.changes > 0) {
            res.status(201).json({
                message: "Issue created successfully",
                createdIssue: returnIssue
            });
        } else {
            res.status(500).json({
                message: "Failed to create issue"
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while creating the issue",
            error: (error as Error).message
        });
    }
});

/**
 * PATCH /api/issues/:id
 * 
 * Updates the status of an existing issue identified by its ID.
 * 
 * URL Parameters:
 * - id (number): Required. The unique identifier of the issue to be updated.
 * 
 * Request Body:
 * - newStatus (string): Required. The new status for the issue. Must be one of "Open", "In Progress", "Resolved".
 * 
 * Success Response:
 * - 200 OK: If the status was updated successfully.
 *   - message (string): Success message indicating the status was updated.
 *   - wasUpdated (boolean): true, indicating the status was changed
 * 
 * - 200 OK: If the new status is identical to the current status.
 *   - message (string): Message indicating no update was performed as the status is already set to the new value.
 *   - wasUpdated (boolean): false, indicating no change was needed
 *   - updatedTimestamp (string): timestamp of when the issue status was updated. null if there was no
 *     change to the status
 * 
 * Error Responses:
 * - 400 Bad Request: If the ID is invalid or the new status is missing or invalid.
 * - 404 Not Found: If no issue with the specified ID exists.
 * - 500 Internal Server Error: If there was an error updating the issue in the database.
 */
app.patch("/api/issues/:id", (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "Invalid issue ID." });
            return;
        }

        const { newStatus } = req.body;
        if (typeof newStatus !== 'string') {
            res.status(400).json({message: "Status must be a string"});
            return;
        }

        const reqStatus: string = newStatus;
        if (!VALIDSTATUSES.includes(reqStatus)) {
            res.status(400).json({message: "Invalid status. Must be 'Open', 'In Progress', or 'Resolved'"});
            return;
        }

        // look for the old issue to update its status
        const stmt = db.prepare("SELECT * FROM issues WHERE id = ?");
        const oldIssue : Issue = stmt.get(id) as Issue;

        if (!oldIssue) {
            res.status(404).json({message: `Issue ID ${id} not found`});
            return;
        }

        // check if the old status matches the new status. If they match, don't modify the issue
        const oldStatus = oldIssue.status;
        if (oldStatus === reqStatus) {
            res.status(200).json({
                message: "New status identical to old one. No updates were performed",
                wasUpdated: false,
                updateTimeStamp: null
            });
            return;
        }
        const updateTimeStamp = getFormattedDate();
        const updateStmt = db.prepare("UPDATE issues SET status = ?, updated_at = ? WHERE id = ?");
        updateStmt.run(reqStatus, updateTimeStamp, id);
        res.status(200).json({
            message: "Status was updated successfully",
            wasUpdated: true,
            updateTimeStamp
        });
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while updating the issue status.",
            error: (error as Error).message
        });
    }
});

/**
 * DELETE /api/issues/:id
 * 
 * Deletes a single issue by its ID.
 * 
 * URL Parameters:
 * - id (number): Required. The ID of the issue to retrieve.
 * 
 * Success Response:
 * - 200 OK: Issue deleted successfully
 *  - message (string): 'Issue deleted successfully'
 * 
 * Error Response:
 * - 400 Bad Request: If the ID is invalid or the issue was not found.
 * - 404 Not Found: If no issue with the specified ID exists.
 * - 500 Internal Server Error: If there was an error fetching the issue from the database.
 */
app.delete("/api/issues/:id", (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "Invalid issue ID." });
            return;
        }

        // delete the old Issue
        const stmt = db.prepare("DELETE FROM issues WHERE id = ?");
        const result = stmt.run(id);
        if (result.changes > 0) {
            res.status(200).json({ message: 'Issue deleted successfully' });
        } else {
            res.status(404).json({ message: `Issue ID ${id} not found` });
        }
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while deleting the issue.",
            error: (error as Error).message
        });
    }
});