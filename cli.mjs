#!/usr/bin/env node

import * as dotenv from "dotenv";
import v from "vorpal";
import got from "got";
import Table from "cli-table";
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
  const total = formattedItems.reduce((m, i) => (m += i.milliliters), 0);

  let table = new Table({ head: ["Date", "mL"] });
  for (let entry of formattedItems) {
    table.push([entry.entry_datetime.toLocaleString(), entry.milliliters]);
  }
  vorpal.log(table.toString());
  vorpal.log(`Total = ${total}mL`);
}

function getDateOffsetUTCString(offset = 0) {
  let datetime = new Date();
  datetime.setDate(datetime.getDate() + offset);

  let dateUTC = new Date(datetime.toUTCString());
  // Set the start of the day to midnight UTC
  dateUTC.setHours(0, 0, 0, 0);
  const startOfDayUTC = new Date(dateUTC.getTime());
  // Set the end of the day to 11:59:59.999 PM UTC
  dateUTC.setHours(23, 59, 59, 999);
  const endOfDayUTC = new Date(dateUTC.getTime());

  return {
    startOfDayUTC,
    endOfDayUTC,
  };
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
  .action(function (_, callback) {
    const { startOfDayUTC, endOfDayUTC } = getDateOffsetUTCString(0);
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
  .command("yesterday", "Lists all the entries for yesterday.")
  .action(function (_, callback) {
    const { startOfDayUTC, endOfDayUTC } = getDateOffsetUTCString(-1);
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
  .command("days-ago <days>", "Lists all the entries for the day.")
  .action(function (args, callback) {
    const { startOfDayUTC, endOfDayUTC } = getDateOffsetUTCString(
      -parseInt(args.days)
    );
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

vorpal.command("all", "Lists all the entries.").action(function (_, callback) {
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
