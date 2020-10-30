# Splitbot

A discord bot that can create expenses on [Splitwise](https://www.splitwise.com/).

> Right now this is hardcoded to work for me and my friends but it wouldn't be hard to change it up to work for anybody. Use as you'd like 👾

## Usage

- to add an expense use the **!split** command
- the **split** command takes up to 3 arguments
  - the total cost being split (ex. 10.45)
  - a list of people to split with (excluding yourself)

### Usage examples

**!split 30 hiro luke**: would charge myself, Hiro and Luke $10 each on Splitwise
**!split 10.50 luke**: would charge me and Luke $5.25 each

## `.env`

Make a `.env` file with the following constants:

```
TOKEN=
CONSUMER_KEY=
CONSUMER_SECRET=
SPLITWISE_GROUP_ID=
```
