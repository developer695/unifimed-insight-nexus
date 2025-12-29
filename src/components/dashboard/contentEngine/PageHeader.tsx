import { Link } from "react-router-dom";



export const PageHeader = () => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">Content Engine</h1>
                <p className="text-muted-foreground mt-1">
                    Agent 5 • Content production and performance analytics
                </p>
            </div>

            <div>
                <Link
                    to="/content/content-upload"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Content Upload Document
                </Link>
            </div>
        </div>
    );
};
