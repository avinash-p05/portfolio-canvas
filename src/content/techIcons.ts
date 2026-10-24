/**
 * Logos shown next to skills in the toolbox, from Devicon (https://devicon.dev, MIT).
 * Vite bundles only the files imported here. Skills without an entry show text only.
 * To add one, find the tech under node_modules/devicon/icons and import its SVG.
 */
import aws from 'devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg';
import kafka from 'devicon/icons/apachekafka/apachekafka-original.svg';
import cplusplus from 'devicon/icons/cplusplus/cplusplus-original.svg';
import docker from 'devicon/icons/docker/docker-original.svg';
import express from 'devicon/icons/express/express-original.svg';
import git from 'devicon/icons/git/git-original.svg';
import githubActions from 'devicon/icons/githubactions/githubactions-original.svg';
import html5 from 'devicon/icons/html5/html5-original.svg';
import java from 'devicon/icons/java/java-original.svg';
import compose from 'devicon/icons/jetpackcompose/jetpackcompose-original.svg';
import junit from 'devicon/icons/junit/junit-original.svg';
import kotlin from 'devicon/icons/kotlin/kotlin-original.svg';
import mongodb from 'devicon/icons/mongodb/mongodb-original.svg';
import nodejs from 'devicon/icons/nodejs/nodejs-original.svg';
import postgresql from 'devicon/icons/postgresql/postgresql-original.svg';
import python from 'devicon/icons/python/python-original.svg';
import react from 'devicon/icons/react/react-original.svg';
import redis from 'devicon/icons/redis/redis-original.svg';
import spring from 'devicon/icons/spring/spring-original.svg';
import typescript from 'devicon/icons/typescript/typescript-original.svg';
import vite from 'devicon/icons/vitejs/vitejs-original.svg';

export interface TechIcon {
  src: string;
  /** Black logos that need inverting to stay visible in dark mode. */
  mono?: boolean;
}

export const techIcons: Record<string, TechIcon> = {
  React: { src: react },
  Vite: { src: vite },
  TypeScript: { src: typescript },
  'HTML/CSS': { src: html5 },
  Kotlin: { src: kotlin },
  'Jetpack Compose': { src: compose },
  Java: { src: java },
  Python: { src: python },
  'C++': { src: cplusplus },
  'Spring Boot': { src: spring },
  'Node.js': { src: nodejs },
  Express: { src: express, mono: true },
  PostgreSQL: { src: postgresql },
  MongoDB: { src: mongodb },
  Redis: { src: redis },
  Kafka: { src: kafka, mono: true },
  Docker: { src: docker },
  AWS: { src: aws, mono: true },
  'CI/CD': { src: githubActions },
  JUnit: { src: junit },
  Git: { src: git },
};
