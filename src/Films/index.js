import React, {Component} from 'react';
import './style.css';
import moment from "moment";

import axios from "axios";

const filmsEndpointURL = "https://app.codescreen.com/api/assessments/films";

//Your API token. This is needed to successfully authenticate when calling the films endpoint. 
//This needs to be added to the Authorization header (using the Bearer authentication scheme) in the request you send to the films endpoint.
const apiToken = "8c5996d5-fb89-46c9-8821-7063cfbc18b1"

export default class Films extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            directorName: '',
            name: '',
            length: '',
            rating: '',
            releaseDays: '',
        }
    }

    handleSubmit = async (e) => {
        !!e && e.preventDefault();
        this.setState({loading: true});
        let {directorName} = this.state;
        let headers = {Authorization: "Bearer " + apiToken};

        let config = {
            method: "GET",
            headers: headers,
            url: filmsEndpointURL,
            params: {directorName},
        }

        try {
            const res = await axios(config);
            if (res.status === 200) {
                this.getBestRatedFilm(res.data);
                this.getLongestFilm(res.data);
                this.getAverageRating(res.data);
                this.getShortestNumberOfDaysBetweenFilmReleases(res.data);
            } else {
                window.alert("Something Went Wrong")
            }
        } catch (e) {
            window.alert(e.message || "Something Went Wrong");
        } finally {
            this.setState({loading: false});
        }
    }

    /**
     * Retrieves the name of the best rated film from the given list of films.
     * If the given list of films is empty, this method should return "N/A".
     */
    getBestRatedFilm(films) {
        let tempFilm = {rating: 0};
        (films || []).forEach((film) => {
            if (film.rating > tempFilm.rating) {
                tempFilm = film;
            }
        })

        this.setState({name: tempFilm.name || "N/A"});
    }

    /**
     * Retrieves the length of the film which has the longest running time from the given list of films.
     * If the given list of films is empty, this method should return "N/A".
     *
     * The return value from this function should be in the form "{length} mins"
     * For example, if the duration of the longest film is 120, this function should return "120 mins".
     */
    getLongestFilm(films) {
        let tempLength = 0;
        (films || []).forEach((film) => {
            if (film.length > tempLength) {
                tempLength = film.length;
            }
        })
        this.setState({length: tempLength ? `${tempLength} Mins` : "N/A"});
    }

    /**
     * Retrieves the average rating for the films from the given list of films, rounded to 1 decimal place.
     * If the given list of films is empty, this method should return 0.
     */
    getAverageRating(films) {
        let average = 0;
        (films || []).forEach((film) => {
            average = average + film.rating;
        })
        if (films.length) {
            average = (average / films.length).toFixed(1)
        }
        this.setState({rating: average || 0});
    }

    /**
     * Retrieves the shortest number of days between any two film releases from the given list of films.
     *
     * If the given list of films is empty, this method should return "N/A".
     * If the given list contains only one film, this method should return 0.
     * Note that no director released more than one film on any given day.
     *
     * For example, if the given list is composed of the following 3 entries
     *
     * {
     *    "name": "Batman Begins",
     *    "length": 140,
     *
     *    "rating": 8.2,
     *    "releaseDate": "2006-06-16",
     *    "directorName": "Christopher Nolan"
     * },
     * {
     *    "name": "Interstellar",
     *    "length": 169,
     *    "rating": 8.6,
     *    "releaseDate": "2014-11-07",
     *    "directorName": "Christopher Nolan"
     * },
     * {
     *   "name": "Prestige",
     *   "length": 130,
     *   "rating": 8.5,
     *   "releaseDate": "2006-11-10",
     *   "directorName": "Christopher Nolan"
     * }
     *
     * then this method should return 147, as Prestige was released 147 days after Batman Begins.
     */
    getShortestNumberOfDaysBetweenFilmReleases(films) {
        let days = 0;
        for (let i = 0; i < films.length; i++) {
            for (let j = i + 1; j < films.length; j++) {
                const temp1 = moment(films[i].releaseDate);
                const temp2 = moment(films[j].releaseDate);
                const tempDays = Math.abs(temp1.diff(temp2, 'days'))
                if (!days) {
                    days = tempDays
                } else if (tempDays < days) {
                    days = tempDays
                }
            }
        }
        this.setState({releaseDays: days || "N/A"});
    }

    render() {
        let {directorName, name, length, rating, releaseDays, loading} = this.state;
        return (
            <div>
                <form id="input-form" className="search-form" onSubmit={this.handleSubmit}>
                    <input id="input-box" value={directorName}
                        onChange={(e) => this.setState({directorName: e.target.value})}
                        required />
                    <button type="submit" disabled={loading} className={`${loading ? "disabled" : ""}`}>
                        {loading ? "Please wait" : 'Submit'}
                    </button>
                </form>

                <div className="cards">
                    <div id="best-rated-film" className="card">
                        <label>Best Rated Film</label>
                        {name}
                    </div>
                    <div id="longest-film" className="card">
                        <label>Longest Film Duration</label>
                        {length}
                    </div>
                    <div id="average-rating" className="card">
                        <label>Average Rating</label>
                        {rating}
                    </div>
                    <div id="shortest-days" className="card">
                        <label>Shortest Day Between Release</label>
                        {releaseDays}
                    </div>
                </div>
            </div>
        )
    }

}
