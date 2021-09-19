import styled from 'styled-components'
import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next'

const BlogTitle = styled.h1`
  font-size: 16px;
  color: green;
`


const Blog = function ({posts}) {
  return (
    <>
    <BlogTitle>blog page</BlogTitle>
    {posts.map((v) => {
      return <li>{v}</li>
    })}
    </>
  )
}

export const getStaticProps: GetStaticProps = async context => {
  return {
    props: {
      posts: ["sample01", "sample02", "sample03"]
    }
  }
}

export default Blog