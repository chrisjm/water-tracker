#!/usr/bin/env node

import * as dotenv from "dotenv";
import v from "vorpal";
import got from "got";
import { sorter } from "sorters";

dotenv.config();
const apiUrl = process.env.API_URL;
const vorpal = v();

function displayItems(items) {
  const formattedItems = items
    .map((i) => {
      return {
        id: i.id.S,
        milliliters: +i.milliliters.N,
        entry_datetime: new Date(i.entry_datetime.S),
      };
    })
    .sort(sorter("entry_datetime"));

  for (let entry of formattedItems) {
    vorpal.log(
      `${entry.entry_datetime.toLocaleString()}: ${entry.milliliters}mL`
    );
  }
}

vorpal
  .command("add <milliliters>", "Adds an entry in milliters")
  .action(function (args, callback) {
    const milliliters = parseInt(args.milliliters);
    got
      .post(`${apiUrl}/add`, {
        json: {
          milliliters,
        },
      })
      .then((response) => {
        const { message } = JSON.parse(response.body);
        this.log(message);
        callback();
      })
      .catch((error) => {
        this.log(`Error adding entry: ${error}`);
        callback();
      });
  });

vorpal
  .command("today", "Lists all the entries for today.")
  .action(function (args, callback) {
    // Get today's date in UTC time
    const today = new Date();
    const todayUTC = new Date(today.toUTCString());

    // Set the start of the day to midnight UTC
    todayUTC.setHours(0, 0, 0, 0);
    const startOfDayUTC = new Date(todayUTC.getTime());
    // Set the end of the day to 11:59:59.999 PM UTC
    todayUTC.setHours(23, 59, 59, 999);
    const endOfDayUTC = new Date(todayUTC.getTime());

    got
      .get(`${apiUrl}/range?start=${startOfDayUTC}&end=${endOfDayUTC}`)
      .then((response) => {
        const data = JSON.parse(response.body);
        displayItems(data.Items);
        callback();
      })
      .catch((error) => {
        this.log(`Error showing today entries: ${error}`);
        callback();
      });
  });

vorpal
  .command("all", "Lists all the entries.")
  .action(function (args, callback) {
    got
      .get(`${apiUrl}/all`)
      .then((response) => {
        const data = JSON.parse(response.body);
        displayItems(data.Items);
        callback();
      })
      .catch((error) => {
        this.log(`Error showing today entries: ${error}`);
        callback();
      });
  });

vorpal.delimiter("water-tracker$").show();
