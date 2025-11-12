const bgColor = document.getElementById("bgc");
const txtColor = document.getElementById("txtc");

bgColor.addEventListener("input", () => {
    preview();
})
txtColor.addEventListener("input", () => {
    preview();
})

function preview (){
    const preview = document.getElementById("preview");
    preview.style.borderRadius = "5px";
    preview.style.backgroundColor = bgColor.value;
    preview.style.color = txtColor.value;
    preview.style.width = "fit-content";
}