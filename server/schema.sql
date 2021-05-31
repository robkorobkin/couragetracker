
CREATE TABLE `exams` (
  `examId` int(11) UNSIGNED NOT NULL,
  `residentId` int(11) UNSIGNED NOT NULL,
  `houseId` int(11) UNSIGNED NOT NULL DEFAULT '0',
  `version` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `answers` varchar(512) COLLATE utf8_unicode_ci NOT NULL,
  `created` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `updated` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
ALTER TABLE `exams`
  ADD PRIMARY KEY (`examId`);
ALTER TABLE `exams`
  MODIFY `examId` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;
