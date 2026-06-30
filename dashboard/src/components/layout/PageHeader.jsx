export default function PageHeader({ title, subtitle }) {
    return (
        <div className="page-header">
            <div>
                <h2>{title}</h2>
                <p>{subtitle}</p>
            </div>
        </div>
    );
}