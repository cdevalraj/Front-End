function Log() {
    return (
        <div>
            <from>
                <input type="text" placeholder="Your username or email" />
                <input type="password" placeholder="Your password" />
                <button>Log In</button>
            </from>
        </div>
    );
}
function Sign()
{
    return (
        <div>
            <from>
                <input type="text" placeholder="First & Last name"/>
                <input type="text" placeholder="Email"/>
                <input type="password" placeholder="Your password"/>
                <button>Create Account</button>
            </from>
        </div>
    );
}
export {Log,Sign};