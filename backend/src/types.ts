export interface Issue {
    id: number;
    title: string;
    description: string;
    status: "Open" | "In Progress" | "Resolved";
    priority: "Low" | "Medium" | "High";
    created_at: string;
    updated_at: string | null;
}

export interface IssueDetails {
    title: string;
    description: string;
    status: "Open" | "In Progress" | "Resolved";
    priority: "Low" | "Medium" | "High";
}