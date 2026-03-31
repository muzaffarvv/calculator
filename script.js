const display = document.getElementById("display");

// Raqam yoki operatorni ekranga qo'shish
function appendToDisplay(input) {
    // Agar ekranda faqat 0 bo'lsa va yangi raqam kiritilsa, 0 ni o'chirib tashlaydi
    if (display.value === "0") {
        display.value = input;
    } else {
        display.value += input;
    }
}

// Ekranni tozalash (C tugmasi)
function clearDisplay() {
    display.value = "";
}

// Oxirgi belgini o'chirish (Backspace tugmasi)
function deleteLast() {
    display.value = display.value.slice(0, -1);
}

// Hisoblash (= tugmasi)
function calculate() {
    try {
        // eval funksiyasi matematik ifodani hisoblaydi
        // Masalan: "2+2*5" -> 12
        display.value = eval(display.value);
    } catch (error) {
        display.value = "Error";
    }
}