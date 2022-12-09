export default function NoteForm({ title, setTitle, con, setCon, submitHandler }) {
    return (
        <form onSubmit={submitHandler}>
            <label align="left">Title:</label>
            <br/>
            <input align="left" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="title"></input>
            <br/>
            <label align="left">Content:</label>
            <br/>
            <textarea align="left" value={con} rows="50" cols="100" onChange={(e) => setCon(e.target.value)} placeholder="title"></textarea>
            <br/>
            <button align="center">Submit</button>
        </form>
    )
}