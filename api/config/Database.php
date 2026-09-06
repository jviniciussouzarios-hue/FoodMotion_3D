<?php
/**
 * FoodMotion 3D - Conexão Segura com Banco de Dados PDO
 */
class Database {
    private static ?PDO $instance = null;

    private static string $host = '127.0.0.1';
    private static string $port = '3306';
    private static string $dbname = 'foodmotion_3d';
    private static string $user = 'root';
    private static string $pass = 'SaborDev1234';

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            try {
                $dsn = "mysql:host=" . self::$host . ";port=" . self::$port . ";dbname=" . self::$dbname . ";charset=utf8mb4";
                self::$instance = new PDO($dsn, self::$user, self::$pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]);
            } catch (PDOException $e) {
                // Tenta fallback sem senha caso o ambiente mude
                try {
                    $dsn = "mysql:host=" . self::$host . ";port=" . self::$port . ";dbname=" . self::$dbname . ";charset=utf8mb4";
                    self::$instance = new PDO($dsn, self::$user, '', [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false
                    ]);
                } catch (PDOException $e2) {
                    throw new RuntimeException("Erro ao conectar no banco de dados: " . $e->getMessage());
                }
            }
        }
        return self::$instance;
    }

    public static function getRawConnectionWithoutDb(): PDO {
        try {
            $dsn = "mysql:host=" . self::$host . ";port=" . self::$port . ";charset=utf8mb4";
            return new PDO($dsn, self::$user, self::$pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
        } catch (PDOException $e) {
            $dsn = "mysql:host=" . self::$host . ";port=" . self::$port . ";charset=utf8mb4";
            return new PDO($dsn, self::$user, '', [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]);
        }
    }
}
