function Sign() {
    return (
        <div>
            <from>
                <div>
                    <input type="text" placeholder="username" required={ true }/>
                </div>
                <div>
                    <input type="text" placeholder="Email" />
                </div>
                <div>
                    <input type="password" placeholder="Your password" required={ true }/>
                </div>
                <button>Create An Account</button>
            </from>
        </div>
    );
}
export default Sign;