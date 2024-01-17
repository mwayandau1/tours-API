const getTokenUser = (user)=>{
    return {name:user.name, id:user.id, role:user.role}
}

module.exports = getTokenUser