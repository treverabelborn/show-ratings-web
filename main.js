const showsDataUrl = 'https://show-ratings-scraper-output.s3.us-east-2.amazonaws.com/test_run.csv';

requirejs(['papa-parse'], function() {
    onPageLoad();
});

function onPageLoad() {
    const showsDiv = document.getElementById('shows');
    showsDiv.innerHTML = '';
    const papa = requirejs('papa-parse');
    const sortKey = document.getElementById('sortControls').value;

    fetchShows(showsDataUrl, papa, showsDiv, sortKey)
}

function fetchShows(url, papaParse, showsDiv, sortKey) {
    fetch(url)
        .then(response => response.text())
        .then(text => papaParse.parse(text, { header: true }))
        .then(json => sortShows(json.data, sortKey))
        .then(sorted => sorted.forEach(s => showsDiv.appendChild(getShowElement(s))));
}

function sortShows(shows, sortKey) {
    switch(sortKey) {
        // Add second sorting order
        case 'criticRating': return shows.sort(sortByCriticRating);
        case 'audienceRating': return shows.sort(sortByAudienceRating);
        case 'avgRating': return shows.sort(sortByAverageRating);
        default: return shows;
    }
}

function sortByCriticRating(a, b) {
    console.log(parse_rating(b.critic_rating))
    if (parse_rating(b.critic_rating) - parse_rating(a.critic_rating) === 0)
        return parse_rating(b.audience_rating) - parse_rating(a.audience_rating);
    return parse_rating(b.critic_rating) - parse_rating(a.critic_rating);
}

function sortByAudienceRating(a, b) {
    if (parse_rating(b.audience_rating) - parse_rating(a.audience_rating) === 0)
        return parse_rating(b.critic_rating) - parse_rating(a.critic_rating);
    return parse_rating(b.audience_rating) - parse_rating(a.audience_rating);
}

function sortByAverageRating(a, b) {
    return getAvgRating(b) - getAvgRating(a);
}

function getAvgRating(show) {
    const c = parse_rating(show.critic_rating);
    const a = parse_rating(show.audience_rating);
    if (!a && !c) return 0;
    if (!c) return a;
    if (!a) return c;
    return (a + c) / 2;
}

function parse_rating(r) {
    if (!r) return 0;
    r_trimmed = r.trim();
    r_numeric = r_trimmed.substring(0, r_trimmed.indexOf('%'))
    return Number(r_numeric);
}

function getShowElement(show) {
    if (!show.title || !show.thumbnail_url) return document.createElement('div');

    // tile container
    const container = document.createElement('div');
    container.classList.add('flex');
    container.classList.add('justify-between');
    container.classList.add('mb-8');
    container.style.width = '800px'

    // info container
    const infoContainer = document.createElement('div');
    infoContainer.classList.add('flex');
    infoContainer.classList.add('flex-col');
    infoContainer.classList.add('justify-between');
    infoContainer.classList.add('pb-8');

    // title
    const showTitle = document.createElement('h2');
    showTitle.innerHTML = show.title;
    showTitle.classList.add('text-3xl');
    showTitle.classList.add('underline');

    // ratings
    const ratingsContainer = document.createElement('div');
    const criticRating = document.createElement('h3');
    criticRating.innerHTML = (`Critic Rating: ${show.critic_rating.trim() ? `${show.critic_rating}` : '--'}`);
    criticRating.classList.add('text-2xl');
    const audienceRating = document.createElement('h3');
    audienceRating.innerHTML = (`Audience Rating: ${show.audience_rating.trim() ? `${show.audience_rating}` : '--'}`);
    audienceRating.classList.add('text-2xl');
    ratingsContainer.appendChild(criticRating);
    ratingsContainer.appendChild(audienceRating);
    
    // image
    const showImage = document.createElement('img');
    showImage.src = show.thumbnail_url;
    showImage.classList.add('h-52');

    infoContainer.appendChild(showTitle);

    // trailer link
    if (show.trailer_url) {
        const trailerLink = document.createElement('a');
        trailerLink.target = '_blank';
        trailerLink.href = show.trailer_url;
        trailerLink.innerHTML = 'Watch Trailer';
        trailerLink.classList.add('text-blue-400')
        trailerLink.classList.add('self-start')
        trailerLink.classList.add('underline')
        infoContainer.appendChild(trailerLink);
    }
    infoContainer.appendChild(ratingsContainer);
    
    container.appendChild(infoContainer);
    container.appendChild(showImage);

    return container;
}
