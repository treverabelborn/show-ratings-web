const showsDataUrl = 'https://show-ratings-scraper-output.s3.us-east-2.amazonaws.com/test_run.csv'

requirejs(['papa-parse'],
    function() {
        const papa = requirejs('papa-parse');
        const showsDiv = document.getElementById('shows');
        const sortKey = document.getElementById('sortControls').value;

        fetch(showsDataUrl)
            .then(response => response.text())
            .then(text => papa.parse(text, { header: true }))
            .then(json => sortShows(json.data, sortKey))
            .then(sorted => insertContent(sorted, showsDiv));
});

function sortShows(shows, sortKey) {
    switch(sortKey) {
        // Add second sorting order
        case 'criticRating': return shows.sort((a, b) => Number(b.critic_rating) - Number(a.critic_rating));
        case 'audienceRating': return shows.sort((a, b) => Number(b.audience_rating) - Number(a.audience_rating));
        case 'avgRating': return shows.sort((a, b) => getAvgRating(b) - getAvgRating(a));
        default: return shows;
    }
}

function getAvgRating(show) {
    const c = show.critic_rating;
    const a = show.audience_rating;
    if (!a && !c) return 0;
    if (!c) return a;
    if (!a) return c;
    return a + c / 2;
}

function insertContent(shows, showsDiv) {
    shows.forEach(show => showsDiv.appendChild(getShowElement(show)))
}

function getShowElement(show) {
    if (!show.title || !show.thumbnail_url) return document.createElement('div');

    // tile container
    const container = document.createElement('div');
    container.classList.add('flex');
    container.classList.add('justify-between');
    container.classList.add('items-center');
    container.classList.add('mb-8');
    container.style.width = '800px'

    // info container
    const infoContainer = document.createElement('div');

    // title
    const showTitle = document.createElement('h2');
    showTitle.innerHTML = show.title;
    showTitle.classList.add('text-3xl')
    showTitle.classList.add('underline')
    showTitle.classList.add('mb-8')

    // ratings
    const criticRating = document.createElement('h3')
    criticRating.innerHTML = (`Critic Rating: ${show.critic_rating ? `${show.critic_rating}%` : '--'}`)
    criticRating.classList.add('text-2xl')
    const audienceRating = document.createElement('h3')
    audienceRating.innerHTML = (`Audience Rating: ${show.audience_rating ? `${show.audience_rating}%` : '--'}`)
    audienceRating.classList.add('text-2xl')
    
    // image
    const showImage = document.createElement('img');
    showImage.src = show.thumbnail_url;
    showImage.classList.add('h-52')

    // compose container
    infoContainer.appendChild(showTitle);
    infoContainer.appendChild(criticRating);
    infoContainer.appendChild(audienceRating);
    container.appendChild(infoContainer);
    container.appendChild(showImage);

    return container;
}
