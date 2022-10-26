import React, { Component } from "react";
import axios from "axios";
import Joke from "../Joke/Joke";
import "./JokeList.css";

class JokeList extends Component {
  static defaultProps = {
    jokesPulled: 10,
  };

  constructor(props) {
    super(props);
    this.state = {
      jokes: [],
    };

    this.generateNewJokes = this.generateNewJokes.bind(this);
    this.vote = this.vote.bind(this);
  }

  componentDidMount() {
    if (this.state.jokes.length < this.props.jokesPulled) this.getJokes();
    console.log("mounted");
  }

  componentDidUpdate() {
    if (this.state.jokes.length < this.props.jokesPulled) this.getJokes();
    console.log("updated");
  }

  async getJokes() {
    try {
      let jokes = this.state.jokes;
      let jokeVotes = this.vote;
      let seenJokes = new Set(jokes.map((j) => j.id));

      while (jokes.length < this.props.jokesPulled) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" },
        });
        let { status, ...joke } = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          jokeVotes[joke.id] = jokeVotes[joke.id] || 0;
          jokes.push({ ...joke, votes: jokeVotes[joke.id] });
        } else {
          console.log("duplicate found!");
        }
      }
      this.setState({ jokes });
    } catch (e) {
      console.log(e);
    }
  }

  generateNewJokes() {
    this.setState({
      jokes: [],
    });
  }

  vote(id, delta) {
    let jokeVotes = this.vote;
    jokeVotes[id] = (jokeVotes[id] || 0) + delta;
    this.setState((st) => ({
      jokes: st.jokes.map((j) =>
        j.id === id ? { ...j, votes: j.votes + delta } : j
      ),
    }));
  }

  render() {
    let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);

    return (
      <div className="JokeList">
        <button className="JokeList-getmore" onClick={this.generateNewJokes}>
          Generate Jokes
        </button>

        {sortedJokes.map((j) => (
          <Joke
            text={j.joke}
            key={j.id}
            id={j.id}
            votes={j.votes}
            vote={this.vote}
          />
        ))}
      </div>
    );
  }
}

export default JokeList;
