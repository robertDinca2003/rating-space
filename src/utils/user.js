const generateUserId = () => {
    return 'user-' + Math.trunc(Math.random()*10000).toString();
};

export const getUserId = () =>{
    let userId = localStorage.getItem("userId");
    if(!userId)
    {
        userId = generateUserId();
        localStorage.setItem("userId",userId);
    }
    return userId;
}

export const getUsername = () =>{
    return localStorage.getItem("username") || "Anonymous";
}

export const setUsername = (username) =>{
    localStorage.setItem('username',username);
}