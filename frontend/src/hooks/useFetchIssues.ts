import { useEffect, useState } from "react";
import { Issue } from "../types";


const useFetchIssues = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const response = await fetch("http://localhost:3000/api/issues");
                if (!response.ok) {
                    throw new Error("Failed to fetch issues");
                }
                const data = await response.json();
                console.log(data);
                setIssues(data.issues);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
        fetchIssues();
    }, []);

    return { issues, loading, error };
}

export default useFetchIssues;