export default function NoteForm({ title, setTitle, con, setCon, submitHandler, deleteHandler }) {
    return (
        <form>
            <label align="left">Title:</label>
            <br />
            <input align="left" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="title"></input>
            <br />
            <label align="left">Content:</label>
            <br />
            <textarea align="left" value={con} rows="50" cols="100" onChange={(e) => setCon(e.target.value)} placeholder="title"></textarea>
            <br />
            {window.location.pathname !== '/note' && (<button onClick={deleteHandler}>delete</button>)}
            <button onClick={submitHandler} align="center">Submit</button>
        </form>
    )
}