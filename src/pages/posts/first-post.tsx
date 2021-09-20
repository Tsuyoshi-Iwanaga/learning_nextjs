import Head from 'next/head'
import Link from 'next/link'

export default function FirstPost() {
  return (
    <>
      <Head>
        <title>First Post</title>
      </Head>
      <h1>FirstPost</h1>
      <h2>
        <Link href="/">
          <a>Back to Top</a>
        </Link>
      </h2>
    </>
  )
}