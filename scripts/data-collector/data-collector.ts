#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { Root } from './interfaces';

// path to your unzipped timeline data from Google Maps Takeout
const datafolder = path.join(__dirname, '../../../timeline-data');
const endfolder = path.join(__dirname, '../../../timeline-data');

function getSourceJsons() {

    let yearFolders = fs.readdirSync(datafolder);

    yearFolders = yearFolders.filter(f => !Number.isNaN(Number.parseInt(f))); // filtering out other stuff eg .DS_Store

    return yearFolders.map(year => {
        const innerPath = path.join(datafolder, year);
        let jsons = fs.readdirSync(innerPath);

        jsons = jsons.filter(jsonName => jsonName.includes('.json'));

        return jsons.map(jsonName => path.join(datafolder, year, jsonName));
    }).flatMap(data => data);
}

function collectDataFromSources(sources: string[]) {
    const places: { longitude: number, latitude: number, timestamp: number }[] = [];

    sources.forEach(source => {
        const jsonString = fs.readFileSync(source, 'utf-8');
        const json: Root = JSON.parse(jsonString);

        json.timelineObjects.forEach(to => {
            if (to.placeVisit) {

                if (!to.placeVisit.location.longitudeE7) {
                    return;
                }

                if (!to.placeVisit.location.latitudeE7) {
                    return;
                }

                const longitude = to.placeVisit.location.longitudeE7 / 10000000;
                const latitude = to.placeVisit.location.latitudeE7 / 10000000;

                const alreadyIn = places.find(p => p.latitude === latitude && p.longitude === longitude);

                if (alreadyIn !== undefined) {
                    return;
                }

                places.push({
                    longitude,
                    latitude,
                    timestamp: Number.parseInt(to.placeVisit.duration.startTimestampMs)
                });
            }
        });
    });

    places.sort((a, b) => a.timestamp - b.timestamp);

    return places;
}

function writeToFile(json: any) {
    fs.writeFileSync(path.join(endfolder, 'timeline.json'), JSON.stringify(json), {
        encoding: 'utf-8'
    });
}

function app() {
    const sources = getSourceJsons();
    const places = collectDataFromSources(sources);
    writeToFile(places);
}

app();