
document.getElementById("addTask").addEventListener("click", function(){
    document.getElementById("taskModal").classList.add("open");
});
window.addEventListener('keydown', (e)=>{
    if(e.key === "Escape"){
        document.getElementById("taskModal").classList.remove("open");
    }
});

document.querySelector("#taskModal .modal_box").addEventListener("click", event => {
    event._isClickWithInModal = true;
});

document.getElementById("taskModal").addEventListener('click' , event => {
    if (event._isClickWithInModal) return;
    event.currentTarget.classList.remove("open");
});

document.getElementById("exchange").addEventListener("click", function(){
    document.getElementById("exModal").classList.add("open");
});
window.addEventListener('keydown', (e)=>{
    if(e.key === "Escape"){
        document.getElementById("exModal").classList.remove("open");
    }
});

document.querySelector("#exModal .exchange_box").addEventListener("click", event => {
    event._isClickWithInModal = true;
});

document.getElementById("exModal").addEventListener('click' , event => {
    if (event._isClickWithInModal) return;
    event.currentTarget.classList.remove("open");
})