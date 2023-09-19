# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.8.0](https://github.com/watson-developer-cloud/discovery-components/compare/v4.7.1...v4.8.0) (2023-09-19)


### Features

* Text view, tooltip for enrichments ([#530](https://github.com/watson-developer-cloud/discovery-components/issues/530)) ([8033a29](https://github.com/watson-developer-cloud/discovery-components/commit/8033a29452028abba2bf65d543dc1edce18b8e93))





## [4.7.1](https://github.com/watson-developer-cloud/discovery-components/compare/v4.7.0...v4.7.1) (2023-08-30)


### Bug Fixes

* tooltip when facet available and border pdf active element ([#531](https://github.com/watson-developer-cloud/discovery-components/issues/531)) ([a152389](https://github.com/watson-developer-cloud/discovery-components/commit/a152389de97a44b4a9463b5885cdb9dc62c95fb7))





# [4.7.0](https://github.com/watson-developer-cloud/discovery-components/compare/v4.6.0...v4.7.0) (2023-08-23)


### Features

* PDF view, single tooltip, show when hovering/selecting an enrichment ([#529](https://github.com/watson-developer-cloud/discovery-components/issues/529)) ([74702a7](https://github.com/watson-developer-cloud/discovery-components/commit/74702a7e2d5da9969dc8d6174d97b64eba2ad89c))





# [4.6.0](https://github.com/watson-developer-cloud/discovery-components/compare/v4.5.0...v4.6.0) (2023-07-26)


### Features

* text active color and PDF highlight/active colors ([#520](https://github.com/watson-developer-cloud/discovery-components/issues/520)) ([760bed3](https://github.com/watson-developer-cloud/discovery-components/commit/760bed35419fadf4036fc12200388d0653f1393a))





## [4.2.1](https://github.com/watson-developer-cloud/discovery-components/compare/v4.2.0...v4.2.1) (2023-04-19)

**Note:** Version bump only for package @ibm-watson/discovery-styles





## [4.1.1](https://github.com/watson-developer-cloud/discovery-components/compare/v4.1.0...v4.1.1) (2022-10-18)


### Bug Fixes

* remove horizontal padding from passages ([#434](https://github.com/watson-developer-cloud/discovery-components/issues/434)) ([bb714a3](https://github.com/watson-developer-cloud/discovery-components/commit/bb714a38e3481546915da3234b3c95c102a68298))





# [4.1.0](https://github.com/watson-developer-cloud/discovery-components/compare/v4.0.2...v4.1.0) (2022-10-12)


### Features

* allow displaying multiple passages from each document ([#397](https://github.com/watson-developer-cloud/discovery-components/issues/397)) ([71cb02a](https://github.com/watson-developer-cloud/discovery-components/commit/71cb02afa43fae219982a9c893c400054eda3559))





# [4.0.0](https://github.com/watson-developer-cloud/discovery-components/compare/v3.1.1...v4.0.0) (2022-10-05)

**Note:** Version bump only for package @ibm-watson/discovery-styles





## [3.0.7](https://github.com/watson-developer-cloud/discovery-components/compare/v3.0.6...v3.0.7) (2022-09-21)

**Note:** Version bump only for package @ibm-watson/discovery-styles





## [3.0.5](https://github.com/watson-developer-cloud/discovery-components/compare/v3.0.4...v3.0.5) (2022-08-29)


### Bug Fixes

* prevent unnecessary horizontal scrollbar ([#394](https://github.com/watson-developer-cloud/discovery-components/issues/394)) ([7fa44bc](https://github.com/watson-developer-cloud/discovery-components/commit/7fa44bc2cd4b215e7753e30bc2602ad5d04d8b0f))





## [3.0.4](https://github.com/watson-developer-cloud/discovery-components/compare/v3.0.3...v3.0.4) (2022-08-18)


### Bug Fixes

* adjust how canvas dimensions are computed ([#385](https://github.com/watson-developer-cloud/discovery-components/issues/385)) ([3a86582](https://github.com/watson-developer-cloud/discovery-components/commit/3a865825b6bf23b1c8da0ccfc5ae0d660e394a76))





# [3.0.0](https://github.com/watson-developer-cloud/discovery-components/compare/v2.1.0...v3.0.0) (2022-07-16)

**Note:** Version bump only for package @ibm-watson/discovery-styles





## [2.0.1](https://github.com/watson-developer-cloud/discovery-components/compare/v2.0.0...v2.0.1) (2022-04-29)

**Note:** Version bump only for package @ibm-watson/discovery-styles





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





# [1.5.0-beta.24](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.23...v1.5.0-beta.24) (2022-02-28)


### Features

* loading pdf view ([#310](https://github.com/watson-developer-cloud/discovery-components/issues/310)) ([0c3b7d0](https://github.com/watson-developer-cloud/discovery-components/commit/0c3b7d0f194097988714c3abe327d481b12b651d))





# [1.5.0-beta.21](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.20...v1.5.0-beta.21) (2022-02-22)


### Features

* update toolbar style ([#307](https://github.com/watson-developer-cloud/discovery-components/issues/307)) ([62b69e1](https://github.com/watson-developer-cloud/discovery-components/commit/62b69e149b7a316c59c1591f9ae4e00bb517d14a))





# [1.5.0-beta.17](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.16...v1.5.0-beta.17) (2022-02-02)


### Features

* support react 17 ([#282](https://github.com/watson-developer-cloud/discovery-components/issues/282)) ([6052f1b](https://github.com/watson-developer-cloud/discovery-components/commit/6052f1bbbbcdfc09a14d8d9d7960ee46401a76e0))





# [1.5.0-beta.14](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.13...v1.5.0-beta.14) (2022-01-21)


### Features

* update preview toolbar design for PDF viewer ([#251](https://github.com/watson-developer-cloud/discovery-components/issues/251)) ([8f8af90](https://github.com/watson-developer-cloud/discovery-components/commit/8f8af9084eb811366a5faa1337f4566d7a6fad9d))





# [1.5.0-beta.13](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.12...v1.5.0-beta.13) (2022-01-21)


### Bug Fixes

* Fix PdfView alignment in DocumentPreview ([#256](https://github.com/watson-developer-cloud/discovery-components/issues/256)) ([4e3631b](https://github.com/watson-developer-cloud/discovery-components/commit/4e3631b47d16805a4d24ea04b0e6a9173318ecf7))





# [1.5.0-beta.11](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.10...v1.5.0-beta.11) (2022-01-21)


### Features

* add "active" state to highlight on PdfViewer ([#259](https://github.com/watson-developer-cloud/discovery-components/issues/259)) ([35c473a](https://github.com/watson-developer-cloud/discovery-components/commit/35c473a0fdef68f928239095fe761e9ac29f2831))





# [1.5.0-beta.10](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.9...v1.5.0-beta.10) (2022-01-19)

**Note:** Version bump only for package @ibm-watson/discovery-styles





# [1.5.0-beta.8](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.7...v1.5.0-beta.8) (2022-01-06)


### Features

* document provider interface ([#249](https://github.com/watson-developer-cloud/discovery-components/issues/249)) ([d24cade](https://github.com/watson-developer-cloud/discovery-components/commit/d24cade2711854832eba3b5b41f0a6192a60b415))





# [1.5.0-beta.5](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.4...v1.5.0-beta.5) (2021-12-09)


### Features

* add PDF viewer with highlighting ([#238](https://github.com/watson-developer-cloud/discovery-components/issues/238)) ([5e06d62](https://github.com/watson-developer-cloud/discovery-components/commit/5e06d62ac146e202c4a7c2a1af5bca6258d746c8))





# [1.5.0-beta.4](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.3...v1.5.0-beta.4) (2021-12-06)


### Features

* add text layer support to PDF viewer ([#237](https://github.com/watson-developer-cloud/discovery-components/issues/237)) ([b9dc342](https://github.com/watson-developer-cloud/discovery-components/commit/b9dc34242644828e5c785ac8adda60963d07e92f))





# [1.5.0-beta.2](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.0...v1.5.0-beta.2) (2021-11-20)

**Note:** Version bump only for package @ibm-watson/discovery-styles





# [1.5.0-beta.1](https://github.com/watson-developer-cloud/discovery-components/compare/v1.5.0-beta.0...v1.5.0-beta.1) (2021-11-19)

**Note:** Version bump only for package @ibm-watson/discovery-styles





## [1.4.1-beta.1](https://github.com/watson-developer-cloud/discovery-components/compare/v1.4.0-beta.10...v1.4.1-beta.1) (2021-11-02)

**Note:** Version bump only for package @ibm-watson/discovery-styles





# [1.4.0-beta.3](https://github.com/watson-developer-cloud/discovery-components/compare/v1.4.0-beta.2...v1.4.0-beta.3) (2021-07-22)


### Bug Fixes

* use "unstable" Carbon Pagination to avoid performance hang ([#195](https://github.com/watson-developer-cloud/discovery-components/issues/195)) ([c40c824](https://github.com/watson-developer-cloud/discovery-components/commit/c40c824d185924fac3c3a096be0750cea1154f3d))





# [1.3.0](https://github.com/watson-developer-cloud/discovery-components/compare/v1.3.0-beta.6...v1.3.0) (2020-12-22)

**Note:** Version bump only for package @ibm-watson/discovery-styles





# [1.2.0](https://github.com/watson-developer-cloud/discovery-components/compare/v1.2.0-rc.0...v1.2.0) (2020-06-24)

**Note:** Version bump only for package @ibm-watson/discovery-styles





## [1.1.1](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.1.0-beta.12...@ibm-watson/discovery-styles@1.1.1) (2020-03-26)

**Note:** Version bump only for package @ibm-watson/discovery-styles





# [1.1.0](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.1.0-beta.12...@ibm-watson/discovery-styles@1.1.0) (2020-03-26)

**Note:** Version bump only for package @ibm-watson/discovery-styles





# [1.1.0-beta.12](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.1.0-beta.11...@ibm-watson/discovery-styles@1.1.0-beta.12) (2020-03-09)


### Bug Fixes

* search facet tag text wrapping ([#105](https://github.com/watson-developer-cloud/discovery-components/issues/105)) ([f206adf](https://github.com/watson-developer-cloud/discovery-components/commit/f206adf))





# [1.1.0-beta.11](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.1.0-beta.10...@ibm-watson/discovery-styles@1.1.0-beta.11) (2020-03-05)


### Features

* add DocumentPreview error message ([#104](https://github.com/watson-developer-cloud/discovery-components/issues/104)) ([e1a7442](https://github.com/watson-developer-cloud/discovery-components/commit/e1a7442))





# [1.1.0-beta.10](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.1.0-beta.9...@ibm-watson/discovery-styles@1.1.0-beta.10) (2020-03-03)


### Bug Fixes

* search facet text not wrapping ([#103](https://github.com/watson-developer-cloud/discovery-components/issues/103)) ([83ce375](https://github.com/watson-developer-cloud/discovery-components/commit/83ce375))





# [1.1.0-beta.9](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.1.0-beta.8...@ibm-watson/discovery-styles@1.1.0-beta.9) (2020-02-14)


### Bug Fixes

* revert node tilde fix ([#96](https://github.com/watson-developer-cloud/discovery-components/issues/96)) ([3ea97f2](https://github.com/watson-developer-cloud/discovery-components/commit/3ea97f2))





# [1.1.0-beta.8](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.1.0-beta.7...@ibm-watson/discovery-styles@1.1.0-beta.8) (2020-02-06)


### Features

* structured query convert inputs ([#83](https://github.com/watson-developer-cloud/discovery-components/issues/83)) ([6c0b19d](https://github.com/watson-developer-cloud/discovery-components/commit/6c0b19d))





# [1.1.0-beta.7](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.7...@ibm-watson/discovery-styles@1.1.0-beta.7) (2020-01-21)


### Bug Fixes

* Remove node tilde ([#40](https://github.com/watson-developer-cloud/discovery-components/issues/40)) ([303ccb1](https://github.com/watson-developer-cloud/discovery-components/commit/303ccb1))


### Features

* structured query add and remove group rules ([#42](https://github.com/watson-developer-cloud/discovery-components/issues/42)) ([8f9ebb1](https://github.com/watson-developer-cloud/discovery-components/commit/8f9ebb1))
* structured query basic ([#22](https://github.com/watson-developer-cloud/discovery-components/issues/22)) ([b992f63](https://github.com/watson-developer-cloud/discovery-components/commit/b992f63))






## [1.0.7](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.7-rc.1...@ibm-watson/discovery-styles@1.0.7) (2020-01-21)

**Note:** Version bump only for package @ibm-watson/discovery-styles




## [1.0.7-rc.1](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.7-rc.0...@ibm-watson/discovery-styles@1.0.7-rc.1) (2020-01-15)

**Note:** Version bump only for package @ibm-watson/discovery-styles




## [1.0.7-rc.0](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.6...@ibm-watson/discovery-styles@1.0.7-rc.0) (2020-01-14)

### Features

- standalone HTML view with table highlighting ([#48](https://github.com/watson-developer-cloud/discovery-components/issues/48)) ([d8b1207](https://github.com/watson-developer-cloud/discovery-components/commit/d8b1207))

# [1.1.0-beta.6](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.1.0-beta.5...@ibm-watson/discovery-styles@1.1.0-beta.6) (2020-01-09)


### Features

* structured query add and remove group rules ([#42](https://github.com/watson-developer-cloud/discovery-components/issues/42)) ([8f9ebb1](https://github.com/watson-developer-cloud/discovery-components/commit/8f9ebb1))





# [1.1.0-beta.5](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.1.0-beta.4...@ibm-watson/discovery-styles@1.1.0-beta.5) (2020-01-02)


### Bug Fixes

* Remove node tilde ([#40](https://github.com/watson-developer-cloud/discovery-components/issues/40)) ([303ccb1](https://github.com/watson-developer-cloud/discovery-components/commit/303ccb1))





# [1.1.0-beta.4](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.7-beta.3...@ibm-watson/discovery-styles@1.1.0-beta.4) (2019-12-23)


### Features

* structured query basic ([#22](https://github.com/watson-developer-cloud/discovery-components/issues/22)) ([b992f63](https://github.com/watson-developer-cloud/discovery-components/commit/b992f63))





# [1.1.0-beta.3](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.7-beta.3...@ibm-watson/discovery-styles@1.1.0-beta.3) (2019-12-23)


### Features

* structured query basic ([#22](https://github.com/watson-developer-cloud/discovery-components/issues/22)) ([b992f63](https://github.com/watson-developer-cloud/discovery-components/commit/b992f63))





# [1.1.0-beta.2](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.7-beta.3...@ibm-watson/discovery-styles@1.1.0-beta.2) (2019-12-20)


### Features

* structured query basic ([#22](https://github.com/watson-developer-cloud/discovery-components/issues/22)) ([b992f63](https://github.com/watson-developer-cloud/discovery-components/commit/b992f63))





# [1.1.0-beta.1](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.7-beta.3...@ibm-watson/discovery-styles@1.1.0-beta.1) (2019-12-19)


### Features

* structured query basic ([#22](https://github.com/watson-developer-cloud/discovery-components/issues/22)) ([b992f63](https://github.com/watson-developer-cloud/discovery-components/commit/b992f63))





# [1.1.0-beta.0](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.7-beta.3...@ibm-watson/discovery-styles@1.1.0-beta.0) (2019-12-19)


### Features

* structured query basic ([#22](https://github.com/watson-developer-cloud/discovery-components/issues/22)) ([b992f63](https://github.com/watson-developer-cloud/discovery-components/commit/b992f63))





## [1.0.7-beta.3](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.6...@ibm-watson/discovery-styles@1.0.7-beta.3) (2019-12-11)



**Note:** Version bump only for package @ibm-watson/discovery-styles




## [1.0.7-beta.2](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.6...@ibm-watson/discovery-styles@1.0.7-beta.2) (2019-12-10)

**Note:** Version bump only for package @ibm-watson/discovery-styles





## [1.0.7-beta.1](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.6...@ibm-watson/discovery-styles@1.0.7-beta.1) (2019-12-10)

**Note:** Version bump only for package @ibm-watson/discovery-styles




## [1.0.7-beta.0](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.4...@ibm-watson/discovery-styles@1.0.7-beta.0) (2019-12-09)


**Note:** Version bump only for package @ibm-watson/discovery-styles




## [1.0.6](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.4...@ibm-watson/discovery-styles@1.0.6) (2019-12-06)


### Bug Fixes

* **SearchResults:** title fallback and footerbar value max length ([#9](https://github.com/watson-developer-cloud/discovery-components/issues/9)) ([7ea3ff1](https://github.com/watson-developer-cloud/discovery-components/commit/7ea3ff1))





## [1.0.6-beta.0](https://github.com/watson-developer-cloud/discovery-components/compare/@ibm-watson/discovery-styles@1.0.4...@ibm-watson/discovery-styles@1.0.6-beta.0) (2019-12-06)


### Bug Fixes

* **SearchResults:** title fallback and footerbar value max length ([#9](https://github.com/watson-developer-cloud/discovery-components/issues/9)) ([7ea3ff1](https://github.com/watson-developer-cloud/discovery-components/commit/7ea3ff1))
