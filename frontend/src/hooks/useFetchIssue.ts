import { useEffect, useState } from "react";
import { Issue } from "../types";


const useFetchIssue = (id: string | undefined) => {
    const [issue, setIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id === undefined) {
            setError("Issue ID is undefined");
            setLoading(false);
            return;
        }
        const fetchIssue = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/issues/${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Issue not found");
                    } else {
                        throw new Error("Failed to fetch issue");
                    }
                }
                const data = await response.json();
                console.log(data);
                setIssue(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
        fetchIssue();
    }, [id]);

    return { issue, loading, error, setIssue };
}

export default useFetchIssue;