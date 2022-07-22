# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.2](https://github.com/watson-developer-cloud/discovery-components/compare/v3.0.1...v3.0.2) (2022-07-22)


### Bug Fixes

* change facet query method to exact match ([#381](https://github.com/watson-developer-cloud/discovery-components/issues/381)) ([972d1b7](https://github.com/watson-developer-cloud/discovery-components/commit/972d1b76be4d05661599e5f7d22ec629ba8cc7ef))
* update tests from phrase query removal ([#383](https://github.com/watson-developer-cloud/discovery-components/issues/383)) ([f6f2bee](https://github.com/watson-developer-cloud/discovery-components/commit/f6f2bee54f90d2b21f984ef6b840609eb7fa566e))





## [3.0.1](https://github.com/watson-developer-cloud/discovery-components/compare/v3.0.0...v3.0.1) (2022-07-18)


### Bug Fixes

* revert to renaming ref prop with forwardRef and HOC ([#379](https://github.com/watson-developer-cloud/discovery-components/issues/379)) ([c118d65](https://github.com/watson-developer-cloud/discovery-components/commit/c118d65c11385287306cc7b3fda14ecc79609cca))





# [3.0.0](https://github.com/watson-developer-cloud/discovery-components/compare/v2.1.0...v3.0.0) (2022-07-16)


### Bug Fixes

* Mitigate some pagination issues in search results ([#340](https://github.com/watson-developer-cloud/discovery-components/issues/340)) ([2e5e00f](https://github.com/watson-developer-cloud/discovery-components/commit/2e5e00f0bc557c2e6b86d0d77f1effef4885aac8))


### BREAKING CHANGES

* - No longer display table-only results with passage results
* - No longer add page size to pagination options (if it wasn't already included)
* - Use count values exclusively (ignore results_per_page)
- Only include each document once in filter string
- Allow pagination to be reset externally
- Test updates
- Review fixes
- Fix tests





# [2.1.0](https://github.com/watson-developer-cloud/discovery-components/compare/v2.0.4...v2.1.0) (2022-06-20)


### Features

* render textLayer optionally ([#366](https://github.com/watson-developer-cloud/discovery-components/issues/366)) ([71d26c7](https://github.com/watson-developer-cloud/discovery-components/commit/71d26c71b32106a5a6706fbd6d1fa330c01f6ba2))





## [2.0.4](https://github.com/watson-developer-cloud/discovery-components/compare/v2.0.3...v2.0.4) (2022-06-14)


### Bug Fixes

* add 'icp4d-api' path for auth url ([#351](https://github.com/watson-developer-cloud/discovery-components/issues/351)) ([0d2a22e](https://github.com/watson-developer-cloud/discovery-components/commit/0d2a22e98461d79b3fab7dee209a43057059c6e5))
* when nodes aren't found, warn in console rather than erroring ([#365](https://github.com/watson-developer-cloud/discovery-components/issues/365)) ([6ae446c](https://github.com/watson-developer-cloud/discovery-components/commit/6ae446c6aa9ff2e74fc34b440f8dcc6a7fc1dd23))





## [2.0.3](https://github.com/watson-developer-cloud/discovery-components/compare/v2.0.2...v2.0.3) (2022-05-17)


### Bug Fixes

* display DocumentPreview properly for documents with tables ([#343](https://github.com/watson-developer-cloud/discovery-components/issues/343)) ([f8f01d7](https://github.com/watson-developer-cloud/discovery-components/commit/f8f01d756de0cab4722690d7fd60bf7cf9b20b47))





## [2.0.2](https://github.com/watson-developer-cloud/discovery-components/compare/v2.0.1...v2.0.2) (2022-05-05)


### Bug Fixes

* render correct doc to show passage highlights ([#344](https://github.com/watson-developer-cloud/discovery-components/issues/344)) ([8123fd6](https://github.com/watson-developer-cloud/discovery-components/commit/8123fd6d6e2b1c570371351391fe59ed8d1f5f8f))





## [2.0.1](https://github.com/watson-developer-cloud/discovery-components/compare/v2.0.0...v2.0.1) (2022-04-29)


### Bug Fixes

* add document id to virtual scroll key ([#341](https://github.com/watson-developer-cloud/discovery-components/issues/341)) ([a351d4e](https://github.com/watson-developer-cloud/discovery-components/commit/a351d4e018aaf11aa664bf1be9db1b19bff9e98f))





# [2.0.0](https://github.com/watson-developer-cloud/discovery-components/compare/v2.0.0-beta.0...v2.0.0) (2022-04-27)

### Features

* limit response size ([#332](https://github.com/watson-developer-cloud/discovery-components/issues/332)) ([0e1f8c3](https://github.com/watson-developer-cloud/discovery-components/commit/0e1f8c351b4760e824596914fb98d7537c1179d6))


### BREAKING CHANGES

* API: `fetchDocuments()` signature has changed. It can now take an array of collection IDs. When fetching a document or set of documents, specify collection ID(s), since document IDs are only unique within a collection, not a project.
* COMPONENT: `SearchResults` now updates the default search parameters of the enclosing `DiscoverySearch` context. This limits the size of the response data; it only requests the document fields that are needed to render that component.





# [2.0.0-beta.0](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.30...v2.0.0-beta.0) (2022-04-25)


### Features

* limit response size ([#332](https://github.com/watson-developer-cloud/discovery-components/issues/332)) ([0e1f8c3](https://github.com/watson-developer-cloud/discovery-components/commit/0e1f8c351b4760e824596914fb98d7537c1179d6))


### BREAKING CHANGES

* API: `fetchDocuments()` signature has changed. It can now take an array of collection IDs. When fetching a document or set of documents, specify collection ID(s), since document IDs are only unique within a collection, not a project.
* COMPONENT: `SearchResults` now updates the default search parameters of the enclosing `DiscoverySearch` context. This limits the size of the response data; it only requests the document fields that are needed to render that component.






# [1.5.0-beta.30](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.29...v1.5.0-beta.30) (2022-03-14)


### Bug Fixes

* show text view if there is no text_mappings ([#322](https://github.com/watson-developer-cloud/discovery-components/issues/322)) ([c579cfd](https://github.com/watson-developer-cloud/discovery-components/commit/c579cfdef0823c700a4261e0c682b493b5c55e6e))





# [1.5.0-beta.29](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.28...v1.5.0-beta.29) (2022-03-12)


### Bug Fixes

* fix page switching issue with PdfViewerWithHighlight ([#323](https://github.com/watson-developer-cloud/discovery-components/issues/323)) ([bd3b7c7](https://github.com/watson-developer-cloud/discovery-components/commit/bd3b7c7a5e47415739799a2afccb476a4db5818e))





# [1.5.0-beta.28](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.27...v1.5.0-beta.28) (2022-03-11)


### Features

* add state change event to DocumentPreview component ([#320](https://github.com/watson-developer-cloud/discovery-components/issues/320)) ([08b2c1a](https://github.com/watson-developer-cloud/discovery-components/commit/08b2c1a3a4b5733bc42397f73320ee7a1dbaf096))





# [1.5.0-beta.27](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.26...v1.5.0-beta.27) (2022-03-10)


### Bug Fixes

* fix PDF highlighting ([#319](https://github.com/watson-developer-cloud/discovery-components/issues/319)) ([e3279b7](https://github.com/watson-developer-cloud/discovery-components/commit/e3279b745653e3521cee84e7181883cb564c7f82))





# [1.5.0-beta.26](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.25...v1.5.0-beta.26) (2022-03-04)


### Bug Fixes

* fix and improve PDF highlighting ([#313](https://github.com/watson-developer-cloud/discovery-components/issues/313)) ([cc53e51](https://github.com/watson-developer-cloud/discovery-components/commit/cc53e51042adb8d9ce28a38c65ea95175706a7e7))





# [1.5.0-beta.25](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.24...v1.5.0-beta.25) (2022-03-02)


### Bug Fixes

* fix broken pdf rendering ([#315](https://github.com/watson-developer-cloud/discovery-components/issues/315)) ([bfbff2a](https://github.com/watson-developer-cloud/discovery-components/commit/bfbff2a55fe7218bb339ff3e704f9d4f22bfc3a0))





# [1.5.0-beta.24](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.23...v1.5.0-beta.24) (2022-02-28)


### Features

* loading pdf view ([#310](https://github.com/watson-developer-cloud/discovery-components/issues/310)) ([0c3b7d0](https://github.com/watson-developer-cloud/discovery-components/commit/0c3b7d0f194097988714c3abe327d481b12b651d))





# [1.5.0-beta.23](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.22...v1.5.0-beta.23) (2022-02-25)


### Bug Fixes

* fix console error on showing DocumentPreview component ([#312](https://github.com/watson-developer-cloud/discovery-components/issues/312)) ([b39c011](https://github.com/watson-developer-cloud/discovery-components/commit/b39c011ada5dda5de1536a1688a18cba2c3074b8))





# [1.5.0-beta.22](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.21...v1.5.0-beta.22) (2022-02-22)


### Features

* add PDFSource support to PDFViewer and DocumentProvider ([#306](https://github.com/watson-developer-cloud/discovery-components/issues/306)) ([b8caee9](https://github.com/watson-developer-cloud/discovery-components/commit/b8caee9e550d75dbc4455fe52e1ab9782c29a0ce))





# [1.5.0-beta.21](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.20...v1.5.0-beta.21) (2022-02-22)


### Features

* update toolbar style ([#307](https://github.com/watson-developer-cloud/discovery-components/issues/307)) ([62b69e1](https://github.com/watson-developer-cloud/discovery-components/commit/62b69e149b7a316c59c1591f9ae4e00bb517d14a))





# [1.5.0-beta.20](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.19...v1.5.0-beta.20) (2022-02-10)


### Bug Fixes

* fix preview type displayed in DocumentPreview ([#294](https://github.com/watson-developer-cloud/discovery-components/issues/294)) ([5ffda28](https://github.com/watson-developer-cloud/discovery-components/commit/5ffda28b8de1261dd7516437f11be11a96849deb))





# [1.5.0-beta.19](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.18...v1.5.0-beta.19) (2022-02-08)


### Features

* highlight passages and tables on PDF in DocumentPreview ([#287](https://github.com/watson-developer-cloud/discovery-components/issues/287)) ([60becca](https://github.com/watson-developer-cloud/discovery-components/commit/60becca54001b74a4f878f82f18c93991be66e14))





# [1.5.0-beta.18](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.17...v1.5.0-beta.18) (2022-02-03)


### Features

* allow fallbackComponent props to DocumentPreview component ([#286](https://github.com/watson-developer-cloud/discovery-components/issues/286)) ([0082600](https://github.com/watson-developer-cloud/discovery-components/commit/008260090201c8376eae8e19f7246e1a76cf0b82))





# [1.5.0-beta.17](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.16...v1.5.0-beta.17) (2022-02-02)


### Features

* support react 17 ([#282](https://github.com/watson-developer-cloud/discovery-components/issues/282)) ([6052f1b](https://github.com/watson-developer-cloud/discovery-components/commit/6052f1bbbbcdfc09a14d8d9d7960ee46401a76e0))





# [1.5.0-beta.16](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.15...v1.5.0-beta.16) (2022-01-31)


### Bug Fixes

* add missing prop to doc provider interface ([#283](https://github.com/watson-developer-cloud/discovery-components/issues/283)) ([e6d6480](https://github.com/watson-developer-cloud/discovery-components/commit/e6d6480dd16f701ca0cd009ecc5c1101f8fdcab4))





# [1.5.0-beta.15](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.14...v1.5.0-beta.15) (2022-01-21)


### Bug Fixes

* fix PDFViewer rendering issue ([#267](https://github.com/watson-developer-cloud/discovery-components/issues/267)) ([c86cb92](https://github.com/watson-developer-cloud/discovery-components/commit/c86cb929437c5aaab6555ed2baa1674dad49c374))





# [1.5.0-beta.14](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.13...v1.5.0-beta.14) (2022-01-21)


### Features

* update preview toolbar design for PDF viewer ([#251](https://github.com/watson-developer-cloud/discovery-components/issues/251)) ([8f8af90](https://github.com/watson-developer-cloud/discovery-components/commit/8f8af9084eb811366a5faa1337f4566d7a6fad9d))





# [1.5.0-beta.13](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.12...v1.5.0-beta.13) (2022-01-21)


### Bug Fixes

* Fix PdfView alignment in DocumentPreview ([#256](https://github.com/watson-developer-cloud/discovery-components/issues/256)) ([4e3631b](https://github.com/watson-developer-cloud/discovery-components/commit/4e3631b47d16805a4d24ea04b0e6a9173318ecf7))





# [1.5.0-beta.12](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.11...v1.5.0-beta.12) (2022-01-21)

**Note:** Version bump only for package root





# [1.5.0-beta.11](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.10...v1.5.0-beta.11) (2022-01-21)


### Features

* add "active" state to highlight on PdfViewer ([#259](https://github.com/watson-developer-cloud/discovery-components/issues/259)) ([35c473a](https://github.com/watson-developer-cloud/discovery-components/commit/35c473a0fdef68f928239095fe761e9ac29f2831))





# [1.5.0-beta.10](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.9...v1.5.0-beta.10) (2022-01-19)

**Note:** Version bump only for package root





# [1.5.0-beta.9](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.8...v1.5.0-beta.9) (2022-01-14)

**Note:** Version bump only for package root





# [1.5.0-beta.8](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.7...v1.5.0-beta.8) (2022-01-06)


### Bug Fixes

* mitigate overlapped or segmented highlight on PDF ([#252](https://github.com/watson-developer-cloud/discovery-components/issues/252)) ([6442420](https://github.com/watson-developer-cloud/discovery-components/commit/6442420e03cba2190cd8a0e730e3987faf26307f))


### Features

* document provider interface ([#249](https://github.com/watson-developer-cloud/discovery-components/issues/249)) ([d24cade](https://github.com/watson-developer-cloud/discovery-components/commit/d24cade2711854832eba3b5b41f0a6192a60b415))





# [1.5.0-beta.7](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.6...v1.5.0-beta.7) (2021-12-13)


### Bug Fixes

* fix PDF highlight misalignment issue ([#253](https://github.com/watson-developer-cloud/discovery-components/issues/253)) ([1dc939b](https://github.com/watson-developer-cloud/discovery-components/commit/1dc939bc9d9dd56cb8005333e1ae073f379af9d9))





# [1.5.0-beta.6](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.5...v1.5.0-beta.6) (2021-12-10)

**Note:** Version bump only for package root





# [1.5.0-beta.5](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.4...v1.5.0-beta.5) (2021-12-09)


### Features

* add PDF viewer with highlighting ([#238](https://github.com/watson-developer-cloud/discovery-components/issues/238)) ([5e06d62](https://github.com/watson-developer-cloud/discovery-components/commit/5e06d62ac146e202c4a7c2a1af5bca6258d746c8))





# [1.5.0-beta.4](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.3...v1.5.0-beta.4) (2021-12-06)


### Bug Fixes

* fix build error ([#247](https://github.com/watson-developer-cloud/discovery-components/issues/247)) ([794ca20](https://github.com/watson-developer-cloud/discovery-components/commit/794ca205bc1c94ca6f187f671ec1dfa5248eed4a))


### Features

* add text layer support to PDF viewer ([#237](https://github.com/watson-developer-cloud/discovery-components/issues/237)) ([b9dc342](https://github.com/watson-developer-cloud/discovery-components/commit/b9dc34242644828e5c785ac8adda60963d07e92f))





# [1.5.0-beta.3](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.2...v1.5.0-beta.3) (2021-12-02)

**Note:** Version bump only for package root





# [1.5.0-beta.2](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.0...v1.5.0-beta.2) (2021-11-20)

**Note:** Version bump only for package root





# [1.5.0-beta.1](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.0...v1.5.0-beta.1) (2021-11-19)

**Note:** Version bump only for package root





# [1.5.0-beta.0](https://github.com/watson-developer-cloud/discovery-components/compare/v1.4.1-beta.2...v1.5.0-beta.0) (2021-11-09)


### Features

* use device pixel ratio to render PDF ([#233](https://github.com/watson-developer-cloud/discovery-components/issues/233)) ([43e0870](https://github.com/watson-developer-cloud/discovery-components/commit/43e087048ccec2c4560344b6881af44c6d84cb1e))





## [1.4.1-beta.2](https://github.com/watson-developer-cloud/discovery-components/compare/v1.4.1-beta.1...v1.4.1-beta.2) (2021-11-09)


### Bug Fixes

* PdfViewer scale parameter issue ([#232](https://github.com/watson-developer-cloud/discovery-components/issues/232)) ([d42ccbf](https://github.com/watson-developer-cloud/discovery-components/commit/d42ccbf8977a3c515153f4eccfc7da96c82b5708))





## [1.4.1-beta.1](https://github.com/watson-developer-cloud/discovery-components/compare/v1.4.0-beta.10...v1.4.1-beta.1) (2021-11-02)


### Bug Fixes

* correct query filter string generation ([#231](https://github.com/watson-developer-cloud/discovery-components/issues/231)) ([a7d9a9f](https://github.com/watson-developer-cloud/discovery-components/commit/a7d9a9f8175fe0fdef92210774d8504d837abc40))





# [1.4.0-beta.10](https://github.com/watson-developer-cloud/discovery-components/compare/v1.4.0-beta.9...v1.4.0-beta.10) (2021-09-27)


### Bug Fixes

* how CJS output handles ListBox import ([#218](https://github.com/watson-developer-cloud/discovery-components/issues/218)) ([b6edd4f](https://github.com/watson-developer-cloud/discovery-components/commit/b6edd4f1bd750e0fea25b6d88ce1072f43f56cdc))





# [1.4.0-beta.9](https://github.com/watson-developer-cloud/discovery-components/compare/v1.4.0-beta.8...v1.4.0-beta.9) (2021-09-27)


### Bug Fixes

* add quotes for file paths ([#214](https://github.com/watson-developer-cloud/discovery-components/issues/214)) ([71248c3](https://github.com/watson-developer-cloud/discovery-components/commit/71248c395ccbd404a40572e19bca72464895ce95))





# [1.4.0-beta.8](https://github.com/watson-developer-cloud/discovery-components/compare/v1.4.0-beta.7...v1.4.0-beta.8) (2021-09-23)


### Bug Fixes

* better tree shaking with @carbon/icons-react and carbon-react-components ([#209](https://github.com/watson-developer-cloud/discovery-components/issues/209)) ([0c3d14e](https://github.com/watson-developer-cloud/discovery-components/commit/0c3d14e3aa3ee6b8afa38e99bd57140b66ac6b6a))





# [1.4.0-beta.7](https://github.com/watson-developer-cloud/discovery-components/compare/v1.4.0-beta.6...v1.4.0-beta.7) (2021-09-17)


### Bug Fixes

* escape/unescape field name in search filters ([#212](https://github.com/watson-developer-cloud/discovery-components/issues/212)) ([c7d5318](https://github.com/watson-developer-cloud/discovery-components/commit/c7d53188926adaa367b3a3166d6e47f7e841f9f7))





# [1.4.0-beta.6](https://github.com/watson-developer-cloud/discovery-components/compare/v1.4.0-beta.5...v1.4.0-beta.6) (2021-09-16)


### Bug Fixes

* safari regex lookbehind ([#211](https://github.com/watson-developer-cloud/discovery-components/issues/211)) ([c9dd8fc](https://github.com/watson-developer-cloud/discovery-components/commit/c9dd8fc04c9c8a5cdfc285607e8e50388b58a60d))





# [1.4.0-beta.5](https://github.com/watson-developer-cloud/discovery-components/compare/v1.4.0-beta.4...v1.4.0-beta.5) (2021-09-03)


### Bug Fixes

* escape field names before building aggregation string ([#207](https://github.com/watson-developer-cloud/discovery-components/issues/207)) ([078e753](https://github.com/watson-developer-cloud/discovery-components/commit/078e7530cb8cd391afa9c08776bd0793cb1c0f60))





# [1.4.0-beta.4](https://github.com/watson-developer-cloud/discovery-components/compare/v1.4.0-beta.3...v1.4.0-beta.4) (2021-08-05)


### Bug Fixes

* use carbon's built-in label for MultiSelect ([#196](https://github.com/watson-developer-cloud/discovery-components/issues/196)) ([a17e2c6](https://github.com/watson-developer-cloud/discovery-components/commit/a17e2c68901d0f4983707919f33c20742597834d))





# [1.4.0-beta.3](https://github.com/watson-developer-cloud/discovery-components/compare/v1.4.0-beta.2...v1.4.0-beta.3) (2021-07-22)


### Bug Fixes

* use "unstable" Carbon Pagination to avoid performance hang ([#195](https://github.com/watson-developer-cloud/discovery-components/issues/195)) ([c40c824](https://github.com/watson-developer-cloud/discovery-components/commit/c40c824d185924fac3c3a096be0750cea1154f3d))





# [1.3.0](https://github.com/watson-developer-cloud/discovery-components/compare/v1.3.0-beta.6...v1.3.0) (2020-12-22)

**Note:** Version bump only for package root



# [1.2.0](https://github.com/watson-developer-cloud/discovery-components/compare/v1.2.0-rc.0...v1.2.0) (2020-06-24)

**Note:** Version bump only for package root
