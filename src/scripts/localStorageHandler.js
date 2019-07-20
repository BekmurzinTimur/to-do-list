const populateLocalStorage = (item,key) => {
    window.localStorage.setItem(key,JSON.stringify(item));
}

const getLocalItem = (key) => {
    return JSON.parse(window.localStorage.getItem(key));
}

const chekStorage = () => {
    let test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}

export {
    populateLocalStorage,
    getLocalItem,
    chekStorage
}