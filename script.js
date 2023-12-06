const message = document.getElementById("message");
const fullNameInput = document.getElementById("name");
const cardNumberInput = document.getElementById("card-number");
const expiryDateInput = document.getElementById("expiry-date");
const cvcInput = document.getElementById("cvc");
const discountCodeInput = document.getElementById("discount-Code");
const applyBtn = document.getElementById("apply-button");
const submitButton = document.querySelector('button[type="submit"]');
submitButton.disabled = true;
let inputMonth;
let inputYear;
let cvcLength = 4;
let cardType = "Unknown";
const mapCardsCVC = new Map([
  ["Mastercard", 3],
  ["Visa", 3],
  // can add more
]);
const logo = document.getElementById("card-logo");
const validationsArr = [false, false, false, false, true];
let isApplied = false;
discountCodeInput.classList.remove("apply");
console.clear();

// let cartArray;
// window.addEventListener("message", (event) => {
//   if (event.origin === "https://yarinnasri.github.io/Shop-Page/index.html") {
//     cartArray = JSON.parse(event.data);
//     console.log("message: " + cartArray);
//   }
// });

let cartArray = JSON.parse(sessionStorage.getItem("shopping-cart"));
createItemList();
updateItemList();

// Event Listeners
submitButton.addEventListener("click", (event) => {
  event.preventDefault();
  alert("Payment information is valid, thank you for buying here!");
  if (cartArray) {
    console.log("updating stock!");
    cartArray.forEach((item) => {
      item.stock = Number(item.stock) - Number(item.quantity);
    });
    sessionStorage.setItem("shopping-cart", JSON.stringify(cartArray));

    // window.postMessage(
    //   JSON.stringify(cartArray),
    //   "https://yarinnasri.github.io/Shop-Page/index.html"
    // );

    setTimeout(() => {
      window.location.href =
        "https://yarinnasri.github.io/Shop-Page/index.html";
    }, 0);
  }
});

fullNameInput.addEventListener("input", () => {
  message.innerText = "";
  fullNameInput.value = fullNameInput.value.replace(/[^A-Za-z\s]/g, "");
  validationsArr[0] = validateFullName(fullNameInput.value);
  checkAllValidations(0);
});

cardNumberInput.addEventListener("input", () => {
  message.innerText = "";
  // Allow only numbers to be added
  let numbersOnly = cardNumberInput.value.replace(/\D/g, "");
  const numbersOnlyGroups = [
    numbersOnly.slice(0, 4),
    numbersOnly.slice(4, 8),
    numbersOnly.slice(8, 12),
    numbersOnly.slice(12, 16),
  ];
  if (numbersOnly.length <= 5) {
    cardNumberInput.value = numbersOnly;
  }

  if (numbersOnly.length > 4) {
    cardNumberInput.value = numbersOnlyGroups[0] + "-" + numbersOnlyGroups[1];
  }

  if (numbersOnly.length > 8) {
    cardNumberInput.value =
      numbersOnlyGroups[0] +
      "-" +
      numbersOnlyGroups[1] +
      "-" +
      numbersOnlyGroups[2];
  }

  if (numbersOnly.length > 12) {
    cardNumberInput.value =
      numbersOnlyGroups[0] +
      "-" +
      numbersOnlyGroups[1] +
      "-" +
      numbersOnlyGroups[2] +
      "-" +
      numbersOnlyGroups[3];
  }

  // validateCardNumber(cardNumberInput.value.split("-").join(""));
  validationsArr[1] = validateCardNumber(
    cardNumberInput.value.split("-").join("")
  );
  validationsArr[3] = validateCVC(cvcInput.value);
  checkAllValidations(1);
  checkAllValidations(3);
});

expiryDateInput.addEventListener("input", () => {
  message.innerText = "";
  // Allow only numbers to be added
  let numbersOnly = expiryDateInput.value.replace(/\D/g, "");

  if (numbersOnly.length < 3) {
    expiryDateInput.value = numbersOnly;
  } else {
    expiryDateInput.value =
      numbersOnly.slice(0, 2) + " / " + numbersOnly.slice(2, 4);
  }
  // // Upadate for validation later
  inputMonth = numbersOnly.slice(0, 2);
  inputYear = numbersOnly.slice(2, 4);
  validationsArr[2] = validateExpiryDate(inputMonth, inputYear);
  checkAllValidations(2);
});

cvcInput.addEventListener("input", () => {
  message.innerText = "";
  if (String(cvcInput.value).length > 4) {
    cvcInput.value = cvcInput.value.slice(0, 4);
  }
  validationsArr[3] = validateCVC(cvcInput.value);
  checkAllValidations(3);
});

discountCodeInput.addEventListener("input", () => {
  if (String(discountCodeInput.value).length > 15) {
    discountCodeInput.value = discountCodeInput.value.slice(0, 15);
  }

  discountCodeInput.value = discountCodeInput.value.replace(/[^A-Z0-9-]/g, "");
});

applyBtn.addEventListener("click", () => {
  message.innerText = "";
  validationsArr[4] = validateDiscountCode(discountCodeInput.value);
  checkAllValidations(4);
});

// Validation Functions
function validateFullName(fullName) {
  fullNameInput.classList.remove("error");
  const regex = /^[A-Z][a-z]{1,14} [A-Z][a-z]{2,14}$/;
  if (regex.test(fullName)) {
    return true;
  }
  fullNameInput.classList.add("error");
  return false;
}

function validateCardNumber(cardNumber) {
  cardNumberInput.classList.remove("error");
  const visaRegex = /^4[0-9]{12}(?:[0-9]{3})?$/;
  const mastercardRegex = /^5[1-5][0-9]{14}$/;

  if (
    visaRegex.test(cardNumber) &&
    cardNumberInput.value.split("-").join("").length == 16
  ) {
    cardType = "Visa";
  } else if (mastercardRegex.test(cardNumber)) {
    cardType = "Mastercard";
  } else {
    cardType = "Unknown";
  }

  if (mapCardsCVC.has(cardType)) {
    logo.src = `./images/${cardType}.png`;
    logo.alt = "card logo";
    cvcLength = mapCardsCVC.get(cardType);
    return true;
  }
  cvcLength = 4;
  logo.removeAttribute("src");
  logo.removeAttribute("alt");
  cardNumberInput.classList.add("error");
  return false;
}

function validateExpiryDate(month, year) {
  expiryDateInput.classList.remove("error");
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear() % 100;

  const inputMonthInt = parseInt(month, 10);
  const inputYearInt = parseInt(year, 10);

  if (inputMonthInt > 0 && inputMonthInt < 13) {
    if (currentYear === inputYearInt) {
      if (currentMonth < inputMonthInt) {
        return true;
      }
    } else if (currentYear < inputYearInt) {
      return true;
    }
  }

  expiryDateInput.classList.add("error");
  return false;
}

function validateCVC(cvc) {
  cvcInput.classList.remove("error");
  if (String(cvc).length == cvcLength && validationsArr[1] == true) {
    return true;
  } else {
    cvcInput.classList.add("error");
    return false;
  }
}

function validateDiscountCode(discountCode) {
  discountCodeInput.classList.remove("error");
  const cleanInputArr = discountCode.split("-");
  const regex1 = /^[A-Z]{8,8}$/;
  const regex2 = /^[0-9]{2,2}$/;
  const regex3 = /^[A-Z]{3,3}$/;
  const isValid =
    regex1.test(cleanInputArr[0]) &&
    regex2.test(cleanInputArr[1]) &&
    regex3.test(cleanInputArr[2]);
  if (isValid || !discountCode) {
    if (isValid) {
      discountCodeInput.classList.add("apply");
      discountCodeInput.disabled = true;
      applyBtn.disabled = true;
      isApplied = true;
      updateItemList();
    }
    return true;
  }
  discountCodeInput.classList.add("error");
  return false;
}

function checkAllValidations(inputIndex) {
  console.log(validationsArr);
  if (!validationsArr[inputIndex]) {
    message.innerText = "Please check and fix the red underline input/s";
  }
  if (validationsArr.includes(false)) {
    submitButton.disabled = true;
    console.log("unvalid");
  } else {
    message.innerText = "";
    submitButton.disabled = false;
    console.log("valid");
  }
}

function updateItemList() {
  const itemList = document.querySelectorAll("li");
  let total = 0;
  for (const item of itemList) {
    const itemName = item.innerText.split("\n")[0];
    // item text
    if (!["Tax", "Total"].includes(itemName)) {
      const priceElement = item.querySelector(".price");
      // item price
      let price = parseFloat(priceElement.textContent.slice(2));
      if (itemName == "Discounts & Offers" && isApplied) {
        price = -1 * (total * 0.2);
        priceElement.innerText = `$ ${price.toFixed(2)}`;
      }
      if (itemName == "Tax (17%)") {
        break;
      }
      total += price;
    }
  }
  const taxPrice = document.getElementById("total-tax");
  const totalElement = document.getElementById("total-price");
  const bigtotalElement = document.getElementById("big-price-text");

  let tax = 0.17 * total;
  taxPrice.innerText = `$ ${tax.toFixed(2)}`;
  totalElement.innerText = `$ ${(total + tax).toFixed(2)}`;
  bigtotalElement.innerText = totalElement.innerText;
}

function createItemList() {
  let listHtml = "";
  if (cartArray) {
    cartArray.forEach((item) => {
      listHtml += `<li>
      <p class="item">${item.quantity}x ${item.name}</p>
      <p class="price">$ ${item.price}</p>
    </li>`;
    });
  } else {
    listHtml += `
    <li>
    <p class="item">Custom Gucci Shoes</p>
    <p class="price">$ 450.00</p>
  </li>
  <li>
    <p class="item">Nivea Cream 400ml</p>
    <p class="price">$ 50.50</p>
  </li>
`;
  }

  listHtml += `
  <li>
  <p class="item">Discounts & Offers</p>
  <p class="price">$ 0.00</p>
</li>

<hr />

<li>
  <p class="item">Tax (17%)</p>
  <p id="total-tax" class="price">$ 0.00</p>
</li>
<li>
  <p class="item">Total</p>
  <p id="total-price" class="price">$ 0.00</p>
</li>

  `;
  document.getElementById("list").innerHTML = listHtml;
}
