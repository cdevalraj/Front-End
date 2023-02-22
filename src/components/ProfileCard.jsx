

export default function Profile()
{
    const username="barry";
    var name="Barry Allen"
    var Description="My name is Barry Allen and I am the fastest man alive."
    var Profession="CSI & Superhero"
    var Date="May, 2022"
    return (
        <div className="container" align="center">
            {/* <img /> */}
            <h2>{name}</h2>
            <h4>@{username}</h4>
            <p>{Description}</p>
            <p>{Profession}</p>
            <span>
                <a href="https://www.github.com" target="blank">G</a>
                &nbsp;
                <a href="https://www.instagram.com" target="blank">I</a>
                &nbsp;
                <a href="https://www.linkedin.com" target="blank">L</a>
                &nbsp;
                <a href="https://www.twitter.com" target="blank">T</a>
            </span>
            <div>
                <label>Joined {Date}</label>
            </div>
        </div>
    );
}