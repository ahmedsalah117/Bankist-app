'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-04-22T17:01:17.194Z',
    '2023-04-23T23:36:17.929Z',
    '2023-04-20T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

let timerInterval;
function logOutTimer() {
  let time = 5 * 60;

  timerInterval = setInterval(() => {
    time--;
    if (time === 0) {
      clearInterval(timerInterval);
      containerApp.style.opacity = 0;
    }
    let min = String(Math.trunc(time / 60)).padStart(2, 0);
    let sec = String(time % 60).padStart(2, 0);
    // console.log(`${min}:${sec}`);
    labelTimer.textContent = `${min}:${sec}`;
  }, 1000);
}

function formatNumbers(value, locale, currency) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    value
  );
}

function calculateDate(date, locale) {
  const calcDiff = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const displayedDate = calcDiff(new Date(), date);
  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // const hour = `${date.getHours()}`.padStart(2, 0);
  // const minute = `${date.getMinutes()}`.padStart(2, 0);

  if (displayedDate === 0) return 'Today';
  if (displayedDate === 1) return 'Yesterday';
  if (displayedDate <= 7) return `${displayedDate} days ago`;
  // `${day}/${month}/${year} - ${hour}:${minute}`
  return new Intl.DateTimeFormat(locale, {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = calculateDate(date, acc.locale);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatNumbers(
          mov,
          acc.locale,
          acc.currency
        )}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  // labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
  labelBalance.textContent = formatNumbers(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  // labelSumIn.textContent = `${incomes.toFixed(2)}€`;
  labelSumIn.textContent = formatNumbers(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  // labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;
  labelSumOut.textContent = formatNumbers(out, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  // labelSumInterest.textContent = `${interest.toFixed(2)}€`;
  labelSumInterest.textContent = formatNumbers(
    interest,
    acc.locale,
    acc.currency
  );
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers

let currentAccount;

//Fake Login....

// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;
// const date = new Date();
// const day = `${date.getDate()}`.padStart(2, 0);
// const month = `${date.getMonth() + 1}`.padStart(2, 0);
// const year = date.getFullYear();
// const hour = `${date.getHours()}`.padStart(2, 0);
// const minute = `${date.getMinutes()}`.padStart(2, 0);
// const formattedDated = new Intl.DateTimeFormat(currentAccount.locale, {
//   hour: 'numeric',
//   minute: 'numeric',
//   day: 'numeric',
//   month: 'numeric',
//   year: 'numeric',
// }).format(date);
// labelDate.textContent = formattedDated;
// `${day}/${month}/${year} - ${hour}:${minute}`
//////////
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();
  if (timerInterval) {
    clearInterval(timerInterval);
    labelTimer.textContent = '05:00';
    logOutTimer();
  } else {
    logOutTimer();
  }
  // const timeMSInFiveMins = Number(new Date()) + 5 * 60 * 1000;
  // let displayedTime = timeMSInFiveMins - new Date();

  // const timerInterval = setInterval(() => {
  //   displayedTime = displayedTime - 1000;
  //   const realTimer = new Intl.DateTimeFormat('en-US', {
  //     minute: '2-digit',
  //     second: '2-digit',
  //   }).format(displayedTime);
  //   labelTimer.textContent = realTimer;
  // }, 1000);

  // setTimeout(() => {
  //   clearInterval(timerInterval);
  // }, 5 * 60 * 1000);
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  if (timerInterval) {
    clearInterval(timerInterval);
    labelTimer.textContent = '05:00';
    logOutTimer();
  }
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  if (timerInterval) {
    clearInterval(timerInterval);
    labelTimer.textContent = '05:00';
    logOutTimer();
  }
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

//Parsing Numbers
//1- parseInt

// console.log(Number.parseInt('20px'));

//2- parseFloat

// console.log(Number.parseFloat('2.5rem'));

//3- isNan... Checks if a value is a valid number or not "it does type coercion then checks the value". If you give it a string it will consider it a string so it will return false.

// console.log(Number.isNaN(20));
// console.log(isNaN('20px'));
// console.log(Number.isNaN(NaN));
// console.log(isNaN('100F'));
// console.log(Number.isFinite(23 / 0));
// console.log(Number.isInteger(23.0));
// console.log(parseInt('2.5px'));

//4- Max , Min , Sqrt ... They do type coercion first
// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2));
// console.log(Math.max(25, 21, 23, 2, 3, 4, 45));
// console.log(Math.min(25, 21, 23, 2, 3, 4, 45));
// console.log(Math.sqrt(25));
// console.log(Math.sqrt(25));

// Constants: for ex PI

//calculating a circle area

// console.log(Math.PI * Number.parseFloat('10px') ** 2);

// const randomInt = (min, max) => {
//   console.log(Math.floor(Math.random() * (max - min + 1) + min));
// };

//This way we will get a number greater than the min and less than or equal to the max number

// randomInt(5, 10);
//Rounding Integer Numbers
// console.log(Math.ceil(12.1)); /// This will always round up to the next number.
// console.log(Math.floor(12.9)); ///This will round down to the same integer number before the dot.
// console.log(Math.trunc(23.3)); //The trunc truncates "cuts off " the dot and anything after the dot.
// console.log((25.255).toFixed(2)); // The toFixed method rounds up or down or adds additional zeros after the dot if necessary " I did not understand its rule , but it's not a big deal". It returns a string

// Numeric Separators.........

// underscore.

// const solarSystemDiameter = 287_460_000_000;

//Here we can use the underscore as a separator ,so that other developers can easily read the number , however JS will ignore these separators and consider it as a one number. PS note that you can not use these underscores right before or after a dot nor at the begining or the end of a number.

// console.log(Number('223_00000')); //You cannot use this separator while parsing numbers from a string as it would consider it NAN.
// console.log(parseInt('233_00000')); // here it will ignore the separator and anything after.
// console.log(parseFloat('233_46000')); // here it will ignore the separator and anything after.

// BigInt >>>> primitive Data Type that was introduced in ES2020 to store huge numbers as JS is not safely capable of storing a number bigger than 9007199254740991 (Number.MAX_SAFE_INTEGER)

// console.log(Number.MAX_SAFE_INTEGER);
// const hugeNo = BigInt(Number.MAX_SAFE_INTEGER) + 500n;
// console.log(hugeNo);

// //Note... You cannot add a Big int to a normal number . You have to convert them.
// // All mathematical operations are applied on Big ints the same way , but for Division it returns the integer part only cause it is a bigInt ^^

// console.log(21n / 2n);
// console.log(20n == "20");//true because JS wil implement type coercion
// console.log(20n === 20);//false because those are 2 different data types and there is no type coercion implid here.

// Dates....

// console.log(new Date()); //now
// console.log(new Date(2023, 3, 23));
// console.log(new Date(5632541)); // the number of milliseconds passed since Jan 1st 1970
// console.log(new Date('April, 23, 2023'));
// console.log(Date.now()); // the number of milliseconds passed since Jan 1st 1970

// const myDate = new Date('April, 23, 2023');

// console.log(myDate.getFullYear());
// console.log('shows the day', myDate.getDate());
// console.log(
//   'shows the index of the week day. zero based starting from sunday',
//   myDate.getDay()
// );
// console.log('shows the hours', myDate.getHours());
// console.log(
//   'shows the index of the month per year. zero based starting from Jan',
//   myDate.getMonth()
// );
// console.log('just formats the date', myDate.toISOString());

//All of these methods have setters versions of course.
//Example

// console.log(myDate.setFullYear(2022));
// console.log(myDate);

// Operations on dates.....

// if you add a date into the number function , it would result in the date in milliseconds "since the unix" , therefore we can implement a lot of operations on it , for example , we can calculate the time difference between two different dates and then display that as "3 days ago" for ex as you see it on facebook and other apps.

// console.log(Number(new Date()))
// Dates Internationalization..........

// const someDate = new Date();
// const locale = navigator.language; // this is to obtain the user's browser locale (language - country)
// const options = {
//   hour: 'numeric',
//   minute: 'numeric',
//   day: 'numeric',
//   month: 'long',
//   year: 'numeric',
// };
// const intlDateFormat = new Intl.DateTimeFormat(locale, options).format(someDate);
// console.log(intlDateFormat);

// SetTimeOut... Schedules the execution of a piece of code

//NOTE>>>>>>> Any additional arguments that you pass to the setTimeOut after the duration are considered to be arguments for the callback fn that will be executed in the future.

// const pizzaTimeOut = setTimeout(
//   (olives, chicken) => {
//     console.log(`your pizza is here 🍕 ${olives} and ${chicken}`);
//   },
//   2900,
//   'olives',
//   'chicken'
// );

// clearTimeout(pizzaTimeOut);

// setInterval .... implements a function every given interval "non-stop unless you stop it"

// const timerEx = setInterval(() => {
//   const timerDate = new Date();
//   const realTimer = new Intl.DateTimeFormat(navigator.language, {
//     hour: 'numeric',
//     minute: '2-digit',
//     second: '2-digit',
//   }).format(timerDate);
//   console.log(realTimer);
// }, 1000);

// clearInterval(timerEx);

// const timeAfter5minsInMiliSecs = Number(new Date()) + 5 * 60 * 1000;
// const realTimeAfter5 = new Date(timeAfter5minsInMiliSecs);
// const displayedTimer = realTimeAfter5 - new Date();
// const formattedRealTime = new Intl.DateTimeFormat('en-US', {
//   minute: '2-digit',
//   second: '2-digit',
// }).format(displayedTimer);
// console.log(formattedRealTime);

// const timeAfter5minsInMiliSecs = Number(new Date()) + 5 * 60 * 1000;
// const realTimeAfter5 = new Date(timeAfter5minsInMiliSecs);// Date & time after 5 mins
// let displayedTimer = realTimeAfter5 - new Date(); // Subtracting the future - current time to display 05:00 on the screen

// setInterval(() => {
//   displayedTimer = displayedTimer - 1000;//Reducing the 05:00 timer by 1000 msec each second to show a timer on the screen
//   const formattedRealTime = new Intl.DateTimeFormat('en-US', {
//     minute: '2-digit',
//     second: '2-digit',
//   }).format(displayedTimer);
//   console.log(formattedRealTime);
// }, 1000);
