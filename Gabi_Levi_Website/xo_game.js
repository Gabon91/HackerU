const buttons = Array.from(document.getElementsByClassName("cell"));

buttons.forEach((cell, index) => {
    cell.addEventListener("click", ()=> {
        console.log("clicked!"+ index);
    });
});

function makeMove(button) {
    button.inn
}