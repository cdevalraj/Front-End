function Log() {
    return (
        <div>
            <from>
                <div>
                    <input type="text"  placeholder="Your username or email" required={ true }/>
                </div>
                <div>
                    <input type="password" placeholder="Your password" required={ true }/>
                </div>
                <button>Log In</button>
            </from>
        </div>
    );
}
export default Log;