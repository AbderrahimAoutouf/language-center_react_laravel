-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 30 avr. 2025 à 01:31
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `language_center1`
--

-- --------------------------------------------------------

--
-- Structure de la table `classes`
--

CREATE TABLE `classes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(254) NOT NULL,
  `school_year` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `level` varchar(255) NOT NULL,
  `cours_id` bigint(20) UNSIGNED NOT NULL,
  `event_color` varchar(255) NOT NULL,
  `teacher_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `classrooms`
--

CREATE TABLE `classrooms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `capacity` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cours`
--

CREATE TABLE `cours` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `duration` varchar(255) NOT NULL,
  `price` decimal(8,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `cours`
--

INSERT INTO `cours` (`id`, `title`, `description`, `duration`, `price`) VALUES
(13, 'espagnol', 'adasd', '120', 120.00),
(14, 'espagnol', 'adasd', '120', 120.00),
(15, 'allemagne', 'dddddd', '120', 120.00),
(16, 'arab', 'dddddd', '120', 120.00),
(17, 'ssssss', 'dddddd', '120', 120.00);

-- --------------------------------------------------------

--
-- Structure de la table `days`
--

CREATE TABLE `days` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `days`
--

INSERT INTO `days` (`id`, `name`) VALUES
(5, 'Friday'),
(1, 'Monday'),
(6, 'Saturday'),
(7, 'Sunday'),
(4, 'Thursday'),
(2, 'Tuesday'),
(3, 'Wednesday');

-- --------------------------------------------------------

--
-- Structure de la table `etudiants`
--

CREATE TABLE `etudiants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `date_naissance` date NOT NULL,
  `sexe` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  `emergency_contact` varchar(255) DEFAULT NULL,
  `level_id` bigint(20) UNSIGNED DEFAULT NULL,
  `age_group` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `etudiants`
--

INSERT INTO `etudiants` (`id`, `parent_id`, `nom`, `prenom`, `date_naissance`, `sexe`, `email`, `adresse`, `telephone`, `emergency_contact`, `level_id`, `age_group`) VALUES
(1, NULL, 'belangour', 'abdessamad', '2002-02-21', 'male', 'abdessamad@gmail.com', 'Bouskoura, Casablanca, Casablanca-Settat, Morocco', '+212669171979', NULL, NULL, 'adult'),
(2, NULL, 'aoutouf', 'abderrahim', '2002-10-10', 'male', NULL, 'aimde, Casablanca, Casablanca-Settat, Morocco', NULL, NULL, NULL, 'adult'),
(3, 1, 'belangour', 'abdessamad', '2010-10-10', 'male', 'abdeqqrqessamad@gmail.com', 'Bouskoura, Casablanca, Casablanca, Morocco', '+212669171971', NULL, NULL, 'teenager');

-- --------------------------------------------------------

--
-- Structure de la table `expenses`
--

CREATE TABLE `expenses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `expense_name` varchar(255) NOT NULL,
  `expense_amount` decimal(8,2) NOT NULL,
  `expense_description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `inscrire_classes`
--

CREATE TABLE `inscrire_classes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `etudiant_id` bigint(20) UNSIGNED NOT NULL,
  `class__id` bigint(20) UNSIGNED DEFAULT NULL,
  `inscription_date` date NOT NULL,
  `payment_status` varchar(255) NOT NULL DEFAULT 'Unpaid',
  `negotiated_price` decimal(8,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `language_levels`
--

CREATE TABLE `language_levels` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `language_levels`
--

INSERT INTO `language_levels` (`id`, `name`) VALUES
(1, 'sadsa'),
(2, 'abde'),
(3, 'aasd adsad'),
(4, 'abderrahim'),
(5, 'abdessamad belangour');

-- --------------------------------------------------------

--
-- Structure de la table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_reset_tokens_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2023_05_19_170848_create_parents_table', 1),
(6, '2023_05_19_170849_create_etudiants_table', 1),
(7, '2023_05_20_155118_create_cours_table', 1),
(8, '2023_05_20_173955_create_class__table', 1),
(9, '2023_05_20_224454_create_inscrire_classes_table', 1),
(10, '2023_06_01_192915_create_payments_table', 1),
(11, '2023_06_04_105514_create_teachers_table', 1),
(12, '2023_06_04_110540_add_teacher_id_to_classes_table', 1),
(13, '2023_06_04_132625_create_classrooms_table', 1),
(14, '2023_06_11_132953_create_days_table', 1),
(15, '2023_06_12_204510_create_time_tables_table', 1),
(16, '2023_06_19_194755_create_students_attendances_table', 1),
(17, '2023_06_22_185025_create_teachers_attendances_table', 1),
(18, '2023_06_29_182459_create_language_levels_table', 1),
(19, '2023_06_29_182608_create_tests_table', 1),
(20, '2023_06_29_183128_add_level_id_to_students', 1),
(21, '2023_07_11_120438_create_register_tests_table', 1),
(22, '2023_07_11_124559_create_test_payments_table', 1),
(23, '2023_07_29_204012_create_expenses_table', 1),
(24, '2023_08_23_214230_add_category_to_etudiants', 1),
(25, '2023_08_26_181631_create_teacher_salaries_table', 1),
(26, '2023_08_28_233742_add_class_teacher_attendance', 1),
(27, '2023_09_03_160310_add_payment_type', 1),
(28, '2023_09_29_194607_add_class_id_to_student_attendance', 1);

-- --------------------------------------------------------

--
-- Structure de la table `parents`
--

CREATE TABLE `parents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nom` varchar(254) NOT NULL,
  `prenom` varchar(254) NOT NULL,
  `cin` varchar(254) NOT NULL,
  `date_naissance` datetime DEFAULT NULL,
  `sexe` varchar(254) DEFAULT NULL,
  `email` varchar(254) DEFAULT NULL,
  `adresse` varchar(254) DEFAULT NULL,
  `telephone` varchar(254) DEFAULT NULL,
  `relationship` varchar(255) NOT NULL DEFAULT 'tuteur',
  `archived` tinyint(1) NOT NULL DEFAULT 0,
  `emergency_contact` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `parents`
--

INSERT INTO `parents` (`id`, `nom`, `prenom`, `cin`, `date_naissance`, `sexe`, `email`, `adresse`, `telephone`, `relationship`, `archived`, `emergency_contact`) VALUES
(1, 'aoutouf', 'abderrahim', 'JA192411', '1987-10-10 00:00:00', 'male', NULL, NULL, '+212619384714', 'père', 0, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `inscrire_class_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(8,2) NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'cash',
  `payment_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'authToken', 'b166bae1675e5672f5419975040713a5015bb0ceabd0423969eed786bc490cfd', '[\"*\"]', '2025-04-29 14:46:23', NULL, '2025-04-15 15:36:33', '2025-04-29 14:46:23');

-- --------------------------------------------------------

--
-- Structure de la table `register_tests`
--

CREATE TABLE `register_tests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `test_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pending','ongoing','completed') NOT NULL DEFAULT 'pending',
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `students_attendances`
--

CREATE TABLE `students_attendances` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `isAbsent` tinyint(1) NOT NULL,
  `reason` text NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `class_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `teachers`
--

CREATE TABLE `teachers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `cin` char(8) NOT NULL,
  `birthday` date DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `speciality` varchar(255) DEFAULT NULL,
  `diploma` varchar(255) DEFAULT NULL,
  `hiredate` date NOT NULL,
  `hourly_rate` int(11) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `teachers`
--

INSERT INTO `teachers` (`id`, `first_name`, `last_name`, `cin`, `birthday`, `address`, `gender`, `speciality`, `diploma`, `hiredate`, `hourly_rate`, `email`, `phone`, `created_at`, `updated_at`, `avatar`, `active`) VALUES
(1, 'AbdoRahim', 'Aoutouf', 'JA19931', NULL, ', , ,', NULL, NULL, NULL, '2025-04-15', NULL, NULL, '0634281726', '2025-04-15 15:37:36', '2025-04-29 14:30:19', NULL, 1);

-- --------------------------------------------------------

--
-- Structure de la table `teachers_attendances`
--

CREATE TABLE `teachers_attendances` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `isAbsent` tinyint(1) NOT NULL,
  `reason` text NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `class_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `teacher_salaries`
--

CREATE TABLE `teacher_salaries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `salary` int(11) NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tests`
--

CREATE TABLE `tests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `price` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `test_payments`
--

CREATE TABLE `test_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `register_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL,
  `payment_method` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `time_tables`
--

CREATE TABLE `time_tables` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED NOT NULL,
  `classroom_id` bigint(20) UNSIGNED NOT NULL,
  `startTime` time NOT NULL,
  `FinishTime` time NOT NULL,
  `day_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `cin` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `birthday` date NOT NULL,
  `gender` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `date_of_hiring` date NOT NULL,
  `role` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `username`, `cin`, `phone`, `address`, `birthday`, `gender`, `image`, `date_of_hiring`, `role`, `email`, `is_active`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin', 'admin2', 'bv1896', '0687439036', 'qooqo', '2002-01-01', 'male', 'empty', '2022-01-01', 'admin', 'admin2@admin.com', 1, NULL, '$2y$10$JEDlSheT/wWWzxQAdMnBaeUR7udVlNEJ/ihR3KC.OfVfy.rhO14EO', NULL, '2025-04-15 16:32:24', '2025-04-15 16:32:24');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `classes_cours_id_foreign` (`cours_id`),
  ADD KEY `classes_teacher_id_foreign` (`teacher_id`);

--
-- Index pour la table `classrooms`
--
ALTER TABLE `classrooms`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `cours`
--
ALTER TABLE `cours`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `days`
--
ALTER TABLE `days`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `days_name_unique` (`name`);

--
-- Index pour la table `etudiants`
--
ALTER TABLE `etudiants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `etudiants_email_unique` (`email`),
  ADD UNIQUE KEY `etudiants_telephone_unique` (`telephone`),
  ADD KEY `etudiants_parent_id_foreign` (`parent_id`),
  ADD KEY `etudiants_level_id_foreign` (`level_id`);

--
-- Index pour la table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Index pour la table `inscrire_classes`
--
ALTER TABLE `inscrire_classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inscrire_classes_etudiant_id_foreign` (`etudiant_id`),
  ADD KEY `inscrire_classes_class__id_foreign` (`class__id`);

--
-- Index pour la table `language_levels`
--
ALTER TABLE `language_levels`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `parents`
--
ALTER TABLE `parents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `parents_cin_unique` (`cin`),
  ADD UNIQUE KEY `parents_email_unique` (`email`);

--
-- Index pour la table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Index pour la table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_inscrire_class_id_foreign` (`inscrire_class_id`);

--
-- Index pour la table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Index pour la table `register_tests`
--
ALTER TABLE `register_tests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `register_tests_student_id_foreign` (`student_id`),
  ADD KEY `register_tests_test_id_foreign` (`test_id`);

--
-- Index pour la table `students_attendances`
--
ALTER TABLE `students_attendances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `students_attendances_student_id_foreign` (`student_id`),
  ADD KEY `students_attendances_class_id_foreign` (`class_id`);

--
-- Index pour la table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `teachers_cin_unique` (`cin`),
  ADD UNIQUE KEY `teachers_phone_unique` (`phone`),
  ADD UNIQUE KEY `teachers_email_unique` (`email`);

--
-- Index pour la table `teachers_attendances`
--
ALTER TABLE `teachers_attendances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teachers_attendances_teacher_id_foreign` (`teacher_id`),
  ADD KEY `teachers_attendances_class_id_foreign` (`class_id`);

--
-- Index pour la table `teacher_salaries`
--
ALTER TABLE `teacher_salaries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_salaries_teacher_id_foreign` (`teacher_id`);

--
-- Index pour la table `tests`
--
ALTER TABLE `tests`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `test_payments`
--
ALTER TABLE `test_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `test_payments_register_id_foreign` (`register_id`);

--
-- Index pour la table `time_tables`
--
ALTER TABLE `time_tables`
  ADD PRIMARY KEY (`id`),
  ADD KEY `time_tables_course_id_foreign` (`course_id`),
  ADD KEY `time_tables_class_id_foreign` (`class_id`),
  ADD KEY `time_tables_classroom_id_foreign` (`classroom_id`),
  ADD KEY `time_tables_day_id_foreign` (`day_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD UNIQUE KEY `users_cin_unique` (`cin`),
  ADD UNIQUE KEY `users_phone_unique` (`phone`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `classrooms`
--
ALTER TABLE `classrooms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `cours`
--
ALTER TABLE `cours`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `days`
--
ALTER TABLE `days`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `etudiants`
--
ALTER TABLE `etudiants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `inscrire_classes`
--
ALTER TABLE `inscrire_classes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `language_levels`
--
ALTER TABLE `language_levels`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT pour la table `parents`
--
ALTER TABLE `parents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `register_tests`
--
ALTER TABLE `register_tests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `students_attendances`
--
ALTER TABLE `students_attendances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `teachers_attendances`
--
ALTER TABLE `teachers_attendances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `teacher_salaries`
--
ALTER TABLE `teacher_salaries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `tests`
--
ALTER TABLE `tests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `test_payments`
--
ALTER TABLE `test_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `time_tables`
--
ALTER TABLE `time_tables`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_cours_id_foreign` FOREIGN KEY (`cours_id`) REFERENCES `cours` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `classes_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`);

--
-- Contraintes pour la table `etudiants`
--
ALTER TABLE `etudiants`
  ADD CONSTRAINT `etudiants_level_id_foreign` FOREIGN KEY (`level_id`) REFERENCES `language_levels` (`id`),
  ADD CONSTRAINT `etudiants_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `inscrire_classes`
--
ALTER TABLE `inscrire_classes`
  ADD CONSTRAINT `inscrire_classes_class__id_foreign` FOREIGN KEY (`class__id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inscrire_classes_etudiant_id_foreign` FOREIGN KEY (`etudiant_id`) REFERENCES `etudiants` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_inscrire_class_id_foreign` FOREIGN KEY (`inscrire_class_id`) REFERENCES `inscrire_classes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `register_tests`
--
ALTER TABLE `register_tests`
  ADD CONSTRAINT `register_tests_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `etudiants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `register_tests_test_id_foreign` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `students_attendances`
--
ALTER TABLE `students_attendances`
  ADD CONSTRAINT `students_attendances_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `students_attendances_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `etudiants` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `teachers_attendances`
--
ALTER TABLE `teachers_attendances`
  ADD CONSTRAINT `teachers_attendances_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teachers_attendances_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`);

--
-- Contraintes pour la table `teacher_salaries`
--
ALTER TABLE `teacher_salaries`
  ADD CONSTRAINT `teacher_salaries_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `test_payments`
--
ALTER TABLE `test_payments`
  ADD CONSTRAINT `test_payments_register_id_foreign` FOREIGN KEY (`register_id`) REFERENCES `register_tests` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `time_tables`
--
ALTER TABLE `time_tables`
  ADD CONSTRAINT `time_tables_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `time_tables_classroom_id_foreign` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `time_tables_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `cours` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `time_tables_day_id_foreign` FOREIGN KEY (`day_id`) REFERENCES `days` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
