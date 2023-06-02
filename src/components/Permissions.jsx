import { useState } from "react";
// import { useNavigate } from "react-router-dom";

export default function Permissions({ setVideo, setAudio,setToggle }) {
    const [v,setV]=useState(false)
    const [a,setA]=useState(false)
    // const nav=useNavigate()
    function HandleJoin(e)
    {
        e.preventDefault();
        setVideo(v);
        setAudio(a);
        setToggle(true);
    }
    return (
        <div>
            <div>
                <label className="switch">
                    <input checked={v} type="checkbox" onChange={(e) => setV(e.target.checked)} />
                    <span className="slider round"></span>
                </label>
            </div>
            <div>
                <label className="switch">
                    <input checked={a} type="checkbox" onChange={(e) => setA(e.target.checked)} />
                    <span className="slider round"></span>
                </label>
            </div>
            {/* <button id="bt" onClick={nav('/video')}>Cancel</button> */}
            <button id="bt" onClick={HandleJoin}>Join</button>
        </div>
    );
}