import express, { Request, Response } from "express";
import dotenv from "dotenv";
import db from "./database";
import { Issue, IssueDetails } from "./types";
import { getFormattedDate } from "./utils";

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("Server running at PORT: ", PORT);
}).on("error", (error) => {
    throw new Error(error.message);
});

app.get("/api/issues", (req: Request, res: Response) => { 
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
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

app.post("/api/issues/create", (req: Request, res: Response) => {
    const {
        title,
        description,
        priority,
        status = "Open"
    }: IssueDetails = req.body;

    // input checking:
    // title, description, and priority are required
    if (!title) {
        res.status(400).json({
            message: "Title required"
        });
        return;
    }
    if (!description) {
        res.status(400).json({
            message: "Description required"
        });
        return;
    }
    if (!priority) {
        res.status(400).json({
            message: "Priority level required"
        });
        return;
    }
    try {
        const stmt = db.prepare("INSERT INTO issues (title, description, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
        const timestamp = getFormattedDate();
        const result = stmt.run(title, description, status, priority, timestamp, null);

        if (result.changes > 0) {
            res.status(201).json({
                message: "Issue created successfully",
                issueId: result.lastInsertRowid
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