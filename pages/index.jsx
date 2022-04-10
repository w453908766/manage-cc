
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {Audit} from '../components/audit'
import config from '../config.json'
import { useState, useEffect, useCallback, useMemo } from 'react'


export default function Main() {
  return (
    <Audit />
  )
}
