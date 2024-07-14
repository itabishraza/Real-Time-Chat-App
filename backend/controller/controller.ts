export const signup = async (req: any, res: any) => {
    try {
        const {fullname, username, password, confirmPassword, gender} = req.body;
    } catch (error) {
        
    }
}

export const login = (req: any, res: any) => {
    console.log("loginUser");
}

export const logout = (req: any, res: any) => {
    console.log("logoutUser");
}