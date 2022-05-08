const titleBox = document.getElementById('title')

const submitButton = document.getElementById('submitButton');
const searchBar = document.getElementById('searchBar');

let searchedSubject;

let resultBox = document.getElementById('resultBox');

let suggestionBox = document.getElementById('suggestionBox');
let suggestionButtons = document.querySelectorAll('.suggestion');


submitButton.addEventListener('click', (e)=>{
    e.preventDefault();
    if (searchBar.value == ''){
        return;
    }
    titleBox.classList.remove('bigversion');

    searchedSubject = adjustResearch(searchBar.value);

    // hide suggestion box
    suggestionBox.classList.add('hidden');

    // delete previous research results
    resultBox.innerHTML = '';

    // add the new results or cope with errors
    fetchBooks()
    .then(response => {
        if (response.work_count == 0){
            createErrorBox('no results found')
        } else {
            response.works.forEach(createBookBox)
        }
    })
    .catch(error => createErrorBox(error.message)); 
})

async function fetchBooks(){
    let bookList = await fetch(`https://openlibrary.org/subjects/${searchedSubject}.json`);  
    return bookList.json(); 
}

function adjustResearch(research){
    research = research.toLowerCase()
    research = research.replace(' ', '_');
    return research;  
}

// errors functioning
function createErrorBox(err){
    errorMessage = `An error has occurred: ${err.toLowerCase()}.`
    let errorBox = document.createElement('p');
    errorBox.classList.add('errorBox');
    errorBox.innerHTML = errorMessage;
    resultBox.appendChild(errorBox);

    // show suggestion box
    suggestionBox.classList.remove('hidden');  
}


// single book informations
function createBookBox(book){
    let bookBox = document.createElement('div');
    bookBox.classList.add('bookBox');
    resultBox.appendChild(bookBox);

    // title
    let bookTitle = document.createElement('p');
    bookTitle.classList.add('bookTitle');
    bookBox.appendChild(bookTitle);
    bookTitle.innerHTML = book.title;

    // for styling purposes only
    let bookBoxCentralSection = document.createElement('div');
    bookBoxCentralSection.classList.add('bookBoxCentralSection');
    bookBox.appendChild(bookBoxCentralSection);

    // image
    let bookImage = document.createElement('img');
    bookImage.src = `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
    bookBoxCentralSection.appendChild(bookImage);

    // author(s)
    let bookAuthors = document.createElement('ul');
    bookAuthors.innerHTML = '<strong>Author(s):<strong>'
    bookBoxCentralSection.appendChild(bookAuthors);
    book.authors.forEach(retrieveAuthors);
    function retrieveAuthors(bookAuthor){
        listedAuthor = document.createElement('li');
        bookAuthors.appendChild(listedAuthor);
        listedAuthor.innerHTML = bookAuthor.name;
    }

    // create more infos button
    let moreInfosButton = document.createElement('button');
    moreInfosButton.innerText = 'Read description'
    bookBox.appendChild(moreInfosButton);
    moreInfosButton.classList.add('descriptionClosed');

    // retrieve single book information
    async function fetchSingleBook(){
        let singleBookInfos = await fetch(`https://openlibrary.org${book.key}.json`)
        return singleBookInfos.json()    
    }

    moreInfosButton.addEventListener('click', ()=>{
        moreInfosButton.classList.toggle('descriptionClosed')
        fetchSingleBook()
        .then(response => toggleDescription(response.description))
        .catch(error => alert(`An error has occurred: ${(error.message).toLowerCase()}`))    
    })

    function toggleDescription(description){
        if (!moreInfosButton.classList.contains('descriptionClosed')){
            let descriptionBox = document.createElement('p');
            descriptionBox.classList.add('descriptionBox');
            descriptionBox.innerHTML = checkDescription(description);
            bookBox.appendChild(descriptionBox);
            moreInfosButton.innerHTML = 'Close description';
        } else {
            bookBox.removeChild(bookBox.lastChild);
            moreInfosButton.innerHTML = 'Read description';
        }
        }
    function checkDescription(description){
        if (typeof description !== 'string'){
            if (description?.value === undefined || typeof description.value !== 'string'){
                return 'Description not available.';
            } else {
                return description.value;
            }
        } else {
            return description;
        }
    }
}

// suggestion box functioning
suggestionButtons.forEach(function(btn){
    btn.addEventListener('click', ()=>{
        searchBar.value = btn.innerHTML;
        searchedSubject = adjustResearch(btn.innerHTML);
        submitButton.dispatchEvent(new Event('click'));
    })
})